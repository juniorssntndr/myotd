import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

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

    const event = JSON.parse(body)

    // Helper to get nested details supporting both direct fields and nested object (Culqi structure)
    const resource = event.data?.object || event.data || {}
    const orderNumber = resource.order_number || resource.metadata?.order_number || ""
    const eventId = resource.id || event.data?.id || ""
    const orderStatus = resource.status || ""

    if (!orderNumber) {
      console.warn("Webhook event missing order number:", event)
      return NextResponse.json({ received: true, warning: "Missing order number" })
    }

    switch (event.type) {
      case "payment.created":
      case "order.creation.succeeded": {
        const order = await prisma.order.findUnique({
          where: { orderNumber },
        })

        if (!order) break

        if (order.status === "PENDING") {
          await prisma.order.update({
            where: { id: order.id },
            data: {
              status: "CONFIRMED",
              culqiPaymentId: eventId,
            },
          })
        }

        break
      }

      case "payment.confirmed":
      case "charge.creation.succeeded": {
        const order = await prisma.order.findUnique({
          where: { orderNumber },
          include: { items: true },
        })

        if (!order) break

        if (order.status === "PENDING" || order.status === "CONFIRMED") {
          await prisma.$transaction(async (tx) => {
            await tx.order.update({
              where: { id: order.id },
              data: {
                status: "PROCESSING",
                culqiPaymentId: eventId,
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

      case "order.status.changed": {
        const isSuccess = orderStatus === "paid" || orderStatus === "completed"
        const isFailed = orderStatus === "failed" || orderStatus === "expired"

        const order = await prisma.order.findUnique({
          where: { orderNumber },
          include: { items: true },
        })

        if (!order) break

        if (isSuccess && (order.status === "PENDING" || order.status === "CONFIRMED")) {
          await prisma.$transaction(async (tx) => {
            await tx.order.update({
              where: { id: order.id },
              data: {
                status: "PROCESSING",
                culqiPaymentId: eventId,
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
        } else if (isFailed && (order.status === "PENDING" || order.status === "CONFIRMED")) {
          await prisma.order.update({
            where: { id: order.id },
            data: { status: "CANCELLED" },
          })
        }

        break
      }

      case "payment.failed":
      case "charge.creation.failed": {
        const order = await prisma.order.findUnique({
          where: { orderNumber },
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

      case "payment.refunded":
      case "refund.creation.succeeded":
      case "charge.refund.succeeded": {
        const order = await prisma.order.findUnique({
          where: { orderNumber },
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
