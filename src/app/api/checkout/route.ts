import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createCulqiPayment } from "@/lib/culqi"
import { getShippingCost } from "@/lib/shipping"
import type { CheckoutBody } from "@/types"

function validateCheckoutPayload(body: CheckoutBody): string | null {
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return "No items in cart"
  }

  if (!body.shippingAddress || !body.paymentMethod) {
    return "Missing shipping address or payment method"
  }

  const invalidItem = body.items.find(
    (item) => !item.productId || !item.variantId || item.quantity <= 0
  )

  if (invalidItem) {
    return "Invalid checkout items"
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para realizar una compra" },
        { status: 401 }
      )
    }

    const body: CheckoutBody = await request.json()
    const validationError = validateCheckoutPayload(body)

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 })
    }

    const { items, shippingAddress, paymentMethod, notes } = body

    const variants = await prisma.productVariant.findMany({
      where: {
        id: { in: items.map((item) => item.variantId) },
      },
      include: {
        product: {
          include: {
            brand: true,
          },
        },
      },
    })

    const variantMap = new Map(variants.map((variant) => [variant.id, variant]))

    const enrichedItems = items.map((item) => {
      const variant = variantMap.get(item.variantId)
      return { item, variant }
    })

    const invalidItems = enrichedItems.filter(({ item, variant }) => {
      return !variant || variant.productId !== item.productId || !variant.product.isActive
    })

    if (invalidItems.length > 0) {
      return NextResponse.json(
        { error: "Uno o más productos ya no están disponibles" },
        { status: 400 }
      )
    }

    const outOfStock = enrichedItems.filter(({ item, variant }) => {
      return (variant?.stock || 0) < item.quantity
    })

    if (outOfStock.length > 0) {
      return NextResponse.json(
        {
          error: "Stock insuficiente",
          details: outOfStock.map(({ item, variant }) => ({
            productId: item.productId,
            variantId: item.variantId,
            name: variant?.product.name || item.name,
            requested: item.quantity,
            available: variant?.stock || 0,
          })),
        },
        { status: 400 }
      )
    }

    const subtotal = enrichedItems.reduce(
      (sum, { item, variant }) => sum + Number(variant?.product.price || 0) * item.quantity,
      0
    )

    const shippingCost = getShippingCost(shippingAddress.district, subtotal)
    const total = subtotal + shippingCost

    const orderCount = await prisma.order.count()
    const orderNumber = `MYOTD-${new Date().getFullYear()}-${String(orderCount + 1).padStart(5, "0")}`

    const created = await prisma.$transaction(async (tx) => {
      const address = await tx.address.create({
        data: {
          userId: session.user.id,
          label: "Envío",
          name: shippingAddress.name,
          phone: shippingAddress.phone,
          address: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.district,
          zipCode: shippingAddress.zipCode,
          isDefault: false,
        },
      })

      const order = await tx.order.create({
        data: {
          orderNumber,
          status: "PENDING",
          subtotal,
          shipping: shippingCost,
          total,
          paymentMethod,
          notes,
          userId: session.user.id,
          addressId: address.id,
          items: {
            create: enrichedItems.map(({ item, variant }) => ({
              productId: item.productId,
              variantId: item.variantId,
              name: variant?.product.name || item.name,
              price: Number(variant?.product.price || item.price),
              quantity: item.quantity,
              total: Number(variant?.product.price || item.price) * item.quantity,
            })),
          },
        },
      })

      return { address, order }
    })

    const description = enrichedItems
      .map(({ item, variant }) => `${variant?.product.name || item.name} x${item.quantity}`)
      .join(", ")

    const culqiResult = await createCulqiPayment({
      amount: total,
      description: `Pedido ${orderNumber}: ${description}`,
      orderNumber,
      email: session.user.email || "",
      shippingAddress: {
        name: shippingAddress.name,
        phone: shippingAddress.phone,
        address: shippingAddress.address,
        city: shippingAddress.city,
        district: shippingAddress.district,
      },
    })

    if (culqiResult.requiresManualConfirmation) {
      await prisma.order.update({
        where: { id: created.order.id },
        data: {
          notes: notes
            ? `${notes}\nPago pendiente de confirmacion manual.`
            : "Pago pendiente de confirmacion manual.",
        },
      })
    }

    if (!culqiResult.success || !culqiResult.checkoutUrl) {
      await prisma.order.update({
        where: { id: created.order.id },
        data: { status: "CANCELLED" },
      })

      return NextResponse.json(
        { error: culqiResult.error || "Error creating payment" },
        { status: 500 }
      )
    }

    if (culqiResult.payment?.id) {
      await prisma.order.update({
        where: { id: created.order.id },
        data: { culqiPaymentId: culqiResult.payment.id },
      })
    }

    return NextResponse.json({
      checkoutUrl: culqiResult.checkoutUrl,
      orderId: created.order.id,
      orderNumber: created.order.orderNumber,
    })
  } catch (error) {
    console.error("Error creating checkout:", error)
    return NextResponse.json({ error: "Error creating checkout" }, { status: 500 })
  }
}
