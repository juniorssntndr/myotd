import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/api-auth"

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

    return NextResponse.json(settings)
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

    const body = await request.json()
    
    // Remove id and updatedAt from body to prevent Prisma errors
    const { id, updatedAt, ...updateData } = body

    const settings = await prisma.storeSettings.upsert({
      where: { id: "singleton" },
      update: updateData,
      create: { id: "singleton", ...updateData },
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json(
      { error: "Error updating settings" },
      { status: 500 }
    )
  }
}