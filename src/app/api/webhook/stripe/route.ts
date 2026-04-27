import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    { error: "Stripe webhook disabled. Use /api/webhook/culqi." },
    { status: 410 }
  )
}
