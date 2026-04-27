import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

interface CulqiWebhookEvent {
  type: string
  data: {
    id: string
    order_number: string
    status: string
    amount: number
    payment_method_type: string
  }
}

function verifyWebhookSignature(body: string, signature: string): boolean {
  const secret = process.env.CULQI_WEBHOOK_SECRET
  if (!secret) return false

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex")

  if (signature.length !== expectedSignature.length) {
    return false
  }

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-culqi-signature")

    if (!signature) {
      return NextResponse.json({ error: "No signature" }, { status: 400 })
    }

    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
    }

    const event: CulqiWebhookEvent = JSON.parse(body)

    switch (event.type) {
      case "payment.created": {
        const order = await prisma.order.findUnique({
          where: { orderNumber: event.data.order_number },
        })

        if (!order) break

        if (order.status === "PENDING") {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: "CONFIRMED",
              culqiPaymentId: event.data.id,
            },
          })
        }

        break
      }

      case "payment.confirmed": {
        const order = await prisma.order.findUnique({
          where: { orderNumber: event.data.order_number },
          include: { items: true },
        })

        if (!order) break

        if (order.status === "PENDING" || order.status === "CONFIRMED") {
          await prisma.$transaction(async (tx) => {
            await tx.order.update({
              where: { id: order.id },
              data: {
                status: "PROCESSING",
                culqiPaymentId: event.data.id,
              },
            })

            for (const item of order.items) {
              if (!item.variantId) continue

              await tx.productVariant.update({
                where: { id: item.variantId },
                data: { stock: { decrement: item.quantity } },
              })
            }
          })
        }

        break
      }

      case "payment.failed": {
        const order = await prisma.order.findUnique({
          where: { orderNumber: event.data.order_number },
        })

        if (!order) break

        if (order.status === "PENDING" || order.status === "CONFIRMED") {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: "CANCELLED" },
          })
        }

        break
      }

      case "payment.refunded": {
        const order = await prisma.order.findUnique({
          where: { orderNumber: event.data.order_number },
          include: { items: true },
        })

        if (!order) break

        await prisma.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: { status: "CANCELLED" },
          })

          for (const item of order.items) {
            if (!item.variantId) continue

            await tx.productVariant.update({
              where: { id: item.variantId },
              data: { stock: { increment: item.quantity } },
            })
          }
        })

        break
      }

      default:
        console.log(`Unhandled webhook event: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}
