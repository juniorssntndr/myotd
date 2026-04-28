import { NextResponse } from "next/server"

import { requireAdmin } from "@/lib/api-auth"
import { getHomeFeaturedOfferCards } from "@/lib/home-featured-offers"

export async function GET() {
  const { response } = await requireAdmin()
  if (response) {
    return response
  }

  try {
    const offers = await getHomeFeaturedOfferCards()
    return NextResponse.json({ offers })
  } catch (error) {
    console.error("featured-offers-preview:", error)
    return NextResponse.json({ error: "Error al cargar ofertas" }, { status: 500 })
  }
}
