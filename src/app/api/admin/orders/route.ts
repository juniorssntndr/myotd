import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-auth"
import { resolveProductImageUrl } from "@/lib/image-url"

export async function GET(request: NextRequest) {
  try {
    const { response } = await requireAdmin()
    if (response) {
      return response
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const where: Record<string, unknown> = {}

    if (status && status !== "all") {
      where.status = status.toUpperCase()
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: { name: true, email: true },
          },
          address: true,
          items: {
            include: {
              product: {
                select: { images: true },
              },
              variant: {
                select: { size: true, color: true, sku: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.order.count({ where }),
    ])

    const transformedOrders = orders.map((order: typeof orders[number]) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: {
        name: order.user.name,
        email: order.user.email,
      },
      status: order.status.toLowerCase(),
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      total: Number(order.total),
      paymentMethod: order.paymentMethod,
      shippingAddress: {
        name: order.address.name,
        address: order.address.address,
        city: order.address.city,
        state: order.address.state,
        zipCode: order.address.zipCode,
      },
      items: order.items.map((item: typeof order.items[number]) => ({
        name: item.name,
        size: item.variant?.size || "",
        color: item.variant?.color || "",
        sku: item.variant?.sku || "",
        quantity: item.quantity,
        price: Number(item.price),
        total: Number(item.total),
        image: resolveProductImageUrl(item.product.images[0] || ""),
      })),
      itemCount: order.items.reduce((sum: number, item: typeof order.items[number]) => sum + item.quantity, 0),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }))

    return NextResponse.json({
      orders: transformedOrders,
      total,
      limit,
      offset,
    })
  } catch (error) {
    console.error("Error fetching admin orders:", error)
    return NextResponse.json(
      { error: "Error fetching orders" },
      { status: 500 }
    )
  }
}
