import "dotenv/config"
import crypto from "crypto"
import { PrismaClient } from "../src/generated/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

type ProductRow = {
  id: string
  slug: string
  name: string
  category: { slug: string }
  variants: { id: string }[]
}

type LegacyStockRow = { id: string; stock: number }

function sanitizeToken(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .toUpperCase()
}

function getDefaultSizes(categorySlug: string): string[] {
  switch (categorySlug) {
    case "zapatillas":
      return ["39", "40", "41", "42", "43"]
    case "accesorios":
      return ["ONE"]
    default:
      return ["S", "M", "L", "XL"]
  }
}

function getDefaultColors(categorySlug: string): string[] {
  if (categorySlug === "accesorios") {
    return ["Negro", "Gris", "Navy"]
  }
  return ["Negro", "Blanco"]
}

async function hasProductsStockColumn(): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_name = 'products'
        AND column_name = 'stock'
    ) AS "exists"
  `

  return Boolean(rows[0]?.exists)
}

function buildVariantMatrix(product: ProductRow, stock: number) {
  const sizes = getDefaultSizes(product.category.slug)
  const colors = getDefaultColors(product.category.slug)

  const matrix = sizes.flatMap((size) => colors.map((color) => ({ size, color })))
  const maxVariants = product.category.slug === "accesorios" ? colors.length : Math.min(matrix.length, 6)
  const variants = matrix.slice(0, maxVariants)

  const perVariant = variants.length > 0 ? Math.floor(stock / variants.length) : 0
  let remainder = variants.length > 0 ? stock % variants.length : 0

  return variants.map((variant, index) => {
    const extra = remainder > 0 ? 1 : 0
    remainder = Math.max(0, remainder - 1)
    const variantStock = Math.max(0, perVariant + extra)

    const sku = [
      sanitizeToken(product.slug).slice(0, 12),
      sanitizeToken(variant.color).slice(0, 3),
      sanitizeToken(variant.size).slice(0, 4),
      `${index + 1}`,
    ].join("-")

    return {
      id: crypto.randomUUID(),
      productId: product.id,
      sku,
      size: variant.size,
      color: variant.color,
      stock: variantStock,
    }
  })
}

async function main() {
  console.log("Starting backfill for product variants...")

  const products = await prisma.product.findMany({
    include: {
      category: { select: { slug: true } },
      variants: { select: { id: true } },
    },
  }) as ProductRow[]

  const needsBackfill = products.filter((product) => product.variants.length === 0)
  if (needsBackfill.length === 0) {
    console.log("No products require variant backfill.")
    return
  }

  const hasStockColumn = await hasProductsStockColumn()
  const legacyStock = new Map<string, number>()

  if (hasStockColumn) {
    const rows = await prisma.$queryRawUnsafe<LegacyStockRow[]>(
      'SELECT "id", COALESCE("stock", 0)::int AS "stock" FROM "products"'
    )

    rows.forEach((row) => legacyStock.set(row.id, Number(row.stock) || 0))
  }

  let totalCreated = 0

  for (const product of needsBackfill) {
    const stock = legacyStock.get(product.id) ?? 0
    const variants = buildVariantMatrix(product, stock)

    if (variants.length === 0) {
      continue
    }

    await prisma.productVariant.createMany({
      data: variants,
      skipDuplicates: true,
    })

    totalCreated += variants.length
  }

  const orphanItems = await prisma.orderItem.findMany({
    where: { variantId: null },
    select: { id: true, productId: true },
  })

  for (const item of orphanItems) {
    const firstVariant = await prisma.productVariant.findFirst({
      where: { productId: item.productId },
      orderBy: { stock: "desc" },
      select: { id: true },
    })

    if (!firstVariant) continue

    await prisma.orderItem.update({
      where: { id: item.id },
      data: { variantId: firstVariant.id },
    })
  }

  console.log(`Backfill completed. Created ${totalCreated} variants.`)
  console.log(`Patched ${orphanItems.length} order items with missing variantId when possible.`)
}

main()
  .catch((error) => {
    console.error("Backfill failed:", error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
