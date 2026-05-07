import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-auth"
import { defaultHomeVisual, sanitizeHomeVisual } from "@/lib/home-visual"

const settingsUpdateSchema = z.object({
  storeName: z.string().min(1),
  storeEmail: z.string().email(),
  storePhone: z.string().min(1),
  storeAddress: z.string().min(1),
  storeDescription: z.string().min(1),
  timezone: z.string().min(1),
  currency: z.string().min(1),
  facebook: z.string().url().or(z.literal("")),
  instagram: z.string().url().or(z.literal("")),
  tiktok: z.string().url().or(z.literal("")),
  showOutOfStock: z.boolean(),
  showStockQuantity: z.boolean(),
  allowReviews: z.boolean(),
  standardShippingCost: z.coerce.number().min(0),
  freeShippingThreshold: z.coerce.number().min(0),
  notifyNewOrders: z.boolean(),
  notifyFailedPayments: z.boolean(),
  notifyLowStock: z.boolean(),
  notifyNewUsers: z.boolean(),
  payCard: z.boolean(),
  payTransfer: z.boolean(),
  payWallet: z.boolean(),
  payCashOnDelivery: z.boolean(),
  homeVisual: z.unknown().optional(),
})

/** Lectura pública para tienda (footer, WhatsApp, home). Escritura solo admin (PUT). */
export async function GET() {
  try {
    let settings = await prisma.storeSettings.findUnique({
      where: { id: "singleton" },
    })

    if (!settings) {
      settings = await prisma.storeSettings.create({
        data: { id: "singleton" },
      })
    }

    return NextResponse.json({
      ...settings,
      homeVisual: sanitizeHomeVisual(settings.homeVisual ?? defaultHomeVisual),
    })
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { error: "Error fetching settings" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { response } = await requireAdmin()
    if (response) {
      return response
    }

    const body = settingsUpdateSchema.parse(await request.json())

    const { homeVisual: homeVisualBody, ...updateData } = body

    const existing = await prisma.storeSettings.findUnique({
      where: { id: "singleton" },
      select: { homeVisual: true },
    })

    const safeHomeVisual =
      homeVisualBody !== undefined
        ? sanitizeHomeVisual(homeVisualBody)
        : sanitizeHomeVisual(existing?.homeVisual ?? defaultHomeVisual)

    const settings = await prisma.storeSettings.upsert({
      where: { id: "singleton" },
      update: { ...updateData, homeVisual: safeHomeVisual },
      create: { id: "singleton", ...updateData, homeVisual: safeHomeVisual },
    })

    return NextResponse.json({
      ...settings,
      homeVisual: sanitizeHomeVisual(settings.homeVisual ?? defaultHomeVisual),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Payload inválido", issues: error.issues },
        { status: 400 }
      )
    }

    console.error("Error updating settings:", error)
    return NextResponse.json(
      { error: "Error updating settings" },
      { status: 500 }
    )
  }
}
