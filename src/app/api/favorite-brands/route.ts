import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { transformBrand } from "@/lib/transformers"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const favoriteBrands = await prisma.favoriteBrand.findMany({
      where: { userId: session.user.id },
      include: {
        brand: {
          include: {
            _count: {
              select: { products: { where: { isActive: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(
      favoriteBrands.map((favorite) => ({
        ...transformBrand(favorite.brand),
        createdAt: favorite.createdAt.toISOString(),
        isFavorite: true,
      }))
    )
  } catch (error) {
    console.error("Error fetching favorite brands:", error)
    return NextResponse.json({ error: "Error fetching favorite brands" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const brandId = typeof body.brandId === "string" ? body.brandId : ""

    if (!brandId) {
      return NextResponse.json({ error: "brandId es requerido" }, { status: 400 })
    }

    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      include: {
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
    })

    if (!brand) {
      return NextResponse.json({ error: "Marca no encontrada" }, { status: 404 })
    }

    await prisma.favoriteBrand.upsert({
      where: {
        userId_brandId: {
          userId: session.user.id,
          brandId,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        brandId,
      },
    })

    return NextResponse.json({
      ...transformBrand(brand),
      isFavorite: true,
    })
  } catch (error) {
    console.error("Error creating favorite brand:", error)
    return NextResponse.json({ error: "Error creating favorite brand" }, { status: 500 })
  }
}
