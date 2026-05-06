import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { transformBrand } from "@/lib/transformers"
import { requireAdmin } from "@/lib/api-auth"

export async function GET() {
  try {
    // Intentamos obtener las marcas con información del catálogo para previsualización
    const brands = await prisma.brand.findMany({
      include: {
        products: {
          where: { 
            isActive: true,
            isFeatured: true 
          },
          take: 1,
          select: {
            images: true
          }
        },
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json(brands.map(transformBrand))
  } catch (error: any) {
    console.error("Error fetching brands:", error)
    
    // Si es un error de conexión, devolvemos un mensaje más útil
    if (error.code === 'ECONNREFUSED' || error.message?.includes('connection')) {
      return NextResponse.json(
        { error: "Error de conexión con la base de datos. Verifique que el servicio PostgreSQL esté activo." },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: "Error al obtener las marcas" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { response } = await requireAdmin()
    if (response) {
      return response
    }

    const body = await request.json()

    if (!body.name || !body.slug) {
      return NextResponse.json(
        { error: "Nombre y slug son obligatorios" },
        { status: 400 }
      )
    }

    const brand = await prisma.brand.create({
      data: {
        name: body.name,
        slug: body.slug,
        logo: body.logo,
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    })

    return NextResponse.json(transformBrand(brand as any), { status: 201 })
  } catch (error: any) {
    console.error("Error creating brand:", error)
    return NextResponse.json(
      { error: "Error al crear la marca" },
      { status: 500 }
    )
  }
}
