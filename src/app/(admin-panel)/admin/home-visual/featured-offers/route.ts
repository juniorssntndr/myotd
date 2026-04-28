import { NextResponse } from "next/server"

export function GET(request: Request) {
  const target = new URL(request.url)
  target.pathname = "/admin/home/featured-offers"
  target.search = ""
  return NextResponse.redirect(target)
}
