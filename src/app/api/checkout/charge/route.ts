import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createCulqiCharge } from "@/lib/culqi"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { error: "Debes iniciar sesión para realizar el pago" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { token, orderNumber } = body

    if (!token || !orderNumber) {
      return NextResponse.json(
        { error: "Faltan parámetros requeridos: token o orderNumber" },
        { status: 400 }
      )
    }

    const email = session.user.email

    // Buscar la orden en la base de datos
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    })

    if (!order) {
      return NextResponse.json(
        { error: "No se encontró la orden especificada" },
        { status: 404 }
      )
    }

    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: `La orden ya no está pendiente (estado actual: ${order.status})` },
        { status: 400 }
      )
    }

    // Ejecutar el cargo a través de Culqi
    try {
      const charge = await createCulqiCharge({
        amount: Number(order.total),
        email,
        sourceId: token,
        orderNumber,
      })

      // Iniciar transacción de base de datos para confirmar pago y restar stock
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: "PROCESSING",
            culqiPaymentId: charge.id,
          },
        })

        // Restar el stock de las variantes correspondientes
        for (const item of order.items) {
          if (!item.variantId) continue

          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          })
        }
      })

      return NextResponse.json({
        success: true,
        orderNumber,
        chargeId: charge.id,
      })
    } catch (culqiError) {
      console.error("Error al procesar el cargo en Culqi:", culqiError)
      return NextResponse.json(
        { error: culqiError instanceof Error ? culqiError.message : "Error al procesar el cargo en la pasarela" },
        { status: 402 } // Payment Required
      )
    }
  } catch (error) {
    console.error("Error en endpoint de cargo:", error)
    return NextResponse.json(
      { error: "Error interno al procesar el pago" },
      { status: 500 }
    )
  }
}
