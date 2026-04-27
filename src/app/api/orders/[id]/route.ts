import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { requireAdmin } from "@/lib/api-auth"

type Params = Promise<{ id: string }>
type OrderStatus = "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"

const VALID_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const { id } = await params
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true } },
        address: true,
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
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    if (order.userId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    return NextResponse.json({
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
      culqiPaymentId: order.culqiPaymentId,
      notes: order.notes,
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
        total: Number(item.total),
        image: item.product.images[0] || "",
      })),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error("Error fetching order:", error)
    return NextResponse.json({ error: "Error fetching order" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const adminCheck = await requireAdmin()
    if (adminCheck.response) {
      return adminCheck.response
    }

    const { id } = await params

    const body = await request.json()
    const requestedStatus = typeof body.status === "string" ? body.status.toUpperCase() : undefined

    if (requestedStatus && !VALID_STATUSES.includes(requestedStatus as OrderStatus)) {
      return NextResponse.json({ error: "Invalid order status" }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const isCancellingNow = requestedStatus === "CANCELLED" && order.status !== "CANCELLED"

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const nextOrder = await tx.order.update({
        where: { id },
        data: {
          ...(requestedStatus ? { status: requestedStatus } : {}),
          notes: body.notes,
        },
      })

      if (isCancellingNow) {
        for (const item of order.items) {
          if (!item.variantId) continue
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          })
        }
      }

      return nextOrder
    })

    return NextResponse.json({
      id: updatedOrder.id,
      orderNumber: updatedOrder.orderNumber,
      status: updatedOrder.status.toLowerCase(),
      updatedAt: updatedOrder.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error("Error updating order:", error)
    return NextResponse.json({ error: "Error updating order" }, { status: 500 })
  }
}
