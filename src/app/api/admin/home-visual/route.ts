import { NextRequest, NextResponse } from "next/server"

import { requireAdmin } from "@/lib/api-auth"
import { prisma } from "@/lib/prisma"
import {
  defaultHomeVisual,
  mergeHomeVisual,
  sanitizeHomeVisual,
  type HomeVisualSettings,
} from "@/lib/home-visual"

async function getOrCreateHomeVisual() {
  let settings = await prisma.storeSettings.findUnique({
    where: { id: "singleton" },
    select: { homeVisual: true },
  })

  if (!settings) {
    settings = await prisma.storeSettings.create({
      data: { id: "singleton", homeVisual: defaultHomeVisual },
      select: { homeVisual: true },
    })
  }

  return sanitizeHomeVisual(settings.homeVisual ?? defaultHomeVisual)
}

export async function GET() {
  const { response } = await requireAdmin()
  if (response) {
    return response
  }

  try {
    const homeVisual = await getOrCreateHomeVisual()
    return NextResponse.json({ homeVisual })
  } catch (error) {
    console.error("home-visual:get", error)
    const details = error instanceof Error ? error.message : "Error desconocido"
    return NextResponse.json(
      { error: "No se pudo cargar home visual", details },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const { response } = await requireAdmin()
  if (response) {
    return response
  }

  try {
    const body = (await request.json()) as { homeVisual?: unknown }
    const currentHomeVisual = await getOrCreateHomeVisual()
    const patch =
      body.homeVisual && typeof body.homeVisual === "object"
        ? (body.homeVisual as Partial<HomeVisualSettings>)
        : {}
    const homeVisual = mergeHomeVisual(currentHomeVisual, patch)

    const settings = await prisma.storeSettings.upsert({
      where: { id: "singleton" },
      update: { homeVisual },
      create: { id: "singleton", homeVisual },
      select: { homeVisual: true },
    })

    return NextResponse.json({
      homeVisual: sanitizeHomeVisual(settings.homeVisual ?? defaultHomeVisual),
    })
  } catch (error) {
    console.error("home-visual:put", error)
    const details = error instanceof Error ? error.message : "Error desconocido"
    return NextResponse.json(
      { error: "No se pudo guardar home visual", details },
      { status: 500 }
    )
  }
}
