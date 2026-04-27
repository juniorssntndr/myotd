import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { requireAdmin } from "@/lib/api-auth"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
                brand: { select: { name: true } },
              },
            },
            variant: {
              select: { id: true, size: true, color: true, sku: true },
            },
          },
        },
        address: true,
      },
      orderBy: { createdAt: "desc" },
    })

    const transformedOrders = orders.map((order: typeof orders[number]) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status.toLowerCase(),
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      total: Number(order.total),
      paymentMethod: order.paymentMethod,
      notes: order.notes,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      shippingAddress: {
        name: order.address.name,
        phone: order.address.phone,
        address: order.address.address,
        city: order.address.city,
        district: order.address.state,
        zipCode: order.address.zipCode,
      },
      items: order.items.map((item: typeof order.items[number]) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        name: item.name,
        brand: item.product.brand.name,
        size: item.variant?.size || "",
        color: item.variant?.color || "",
        sku: item.variant?.sku || "",
        price: Number(item.price),
        quantity: item.quantity,
        image: item.product.images[0] || "",
        total: Number(item.total),
      })),
    }))

    return NextResponse.json(transformedOrders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Error fetching orders" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { response } = await requireAdmin()
    if (response) {
      return response
    }

    const body = await request.json()

    const orderCount = await prisma.order.count()
    const orderNumber = `MYOTD-${new Date().getFullYear()}-${String(orderCount + 1).padStart(5, "0")}`

    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: "PENDING",
        subtotal: body.subtotal,
        shipping: body.shipping,
        total: body.total,
        paymentMethod: body.paymentMethod,
        notes: body.notes,
        userId: body.userId,
        addressId: body.addressId,
        items: {
          create: body.items.map((item: {
            productId: string
            variantId?: string
            name: string
            price: number
            quantity: number
          }) => ({
            productId: item.productId,
            variantId: item.variantId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity,
          })),
        },
      },
      include: {
        items: true,
        address: true,
      },
    })

    return NextResponse.json(
      {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: Number(order.total),
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating order:", error)
    return NextResponse.json({ error: "Error creating order" }, { status: 500 })
  }
}
