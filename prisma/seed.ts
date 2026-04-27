import "dotenv/config"
import { PrismaClient } from "../src/generated/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"
import { products, categories, brands } from "../src/data/mock-products"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const DEFAULT_TEST_PASSWORD = "admin123"

async function main() {
  console.log("Seeding Myotd database...")
  const passwordHash = await bcrypt.hash(DEFAULT_TEST_PASSWORD, 10)

  await prisma.favoriteBrand.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.address.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.brand.deleteMany()
  await prisma.user.deleteMany()

  const categoryMap = new Map<string, string>()
  for (const category of categories) {
    const created = await prisma.category.create({
      data: {
        name: category.name,
        slug: category.slug,
        icon: category.icon,
      },
    })
    categoryMap.set(category.slug, created.id)
  }
  console.log(`Created ${categories.length} categories`)

  const brandMap = new Map<string, string>()
  for (const brand of brands) {
    const created = await prisma.brand.create({
      data: {
        name: brand.name,
        slug: brand.slug,
        logo: brand.logo,
      },
    })
    brandMap.set(brand.name, created.id)
  }
  console.log(`Created ${brands.length} brands`)

  for (const product of products) {
    const categoryId = categoryMap.get(product.category)
    const brandId = brandMap.get(product.brand)

    if (!categoryId || !brandId) {
      console.warn(`Skipping product due to missing category/brand mapping: ${product.slug}`)
      continue
    }

    await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        comparePrice: product.originalPrice,
        images: product.images,
        specs: {
          shortDescription: product.shortDescription,
          sizes: product.sizes,
          colors: product.colors,
        },
        isNew: product.isNew,
        isFeatured: product.isFeatured,
        isActive: product.isActive,
        categoryId,
        brandId,
        variants: {
          create: product.variants.map((variant) => ({
            id: variant.id,
            sku: variant.sku,
            size: variant.size,
            color: variant.color,
            stock: variant.stock,
          })),
        },
      },
    })
  }

  console.log(`Created ${products.length} products with variants`)

  const adminUser = await prisma.user.create({
    data: {
      email: "admin@myotd.pe",
      password: passwordHash,
      name: "Admin Myotd",
      phone: "+51 999 888 777",
      role: "ADMIN",
      status: "ACTIVE",
    },
  })

  const customerUser = await prisma.user.create({
    data: {
      email: "cliente@myotd.pe",
      password: passwordHash,
      name: "Cliente Demo",
      phone: "+51 987 654 321",
      role: "CUSTOMER",
      status: "ACTIVE",
    },
  })

  await prisma.address.create({
    data: {
      label: "Casa",
      name: "Cliente Demo",
      phone: "+51 987 654 321",
      address: "Av. Javier Prado 1234",
      city: "Lima",
      state: "Miraflores",
      zipCode: "15074",
      isDefault: true,
      userId: customerUser.id,
    },
  })

  const nikeBrandId = brandMap.get("Nike")
  const adidasBrandId = brandMap.get("Adidas")
  const newBalanceBrandId = brandMap.get("New Balance")

  if (nikeBrandId && adidasBrandId && newBalanceBrandId) {
    await prisma.favoriteBrand.createMany({
      data: [
        { userId: customerUser.id, brandId: nikeBrandId },
        { userId: customerUser.id, brandId: adidasBrandId },
        { userId: customerUser.id, brandId: newBalanceBrandId },
      ],
    })
  }

  console.log(`Created admin user: ${adminUser.email}`)
  console.log(`Created customer user: ${customerUser.email}`)
  console.log("Myotd seed completed")
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
