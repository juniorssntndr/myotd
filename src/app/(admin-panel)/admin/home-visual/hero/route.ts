import { NextResponse } from "next/server"

function redirectToHero(request: Request) {
  const target = new URL(request.url)
  target.pathname = "/admin/home/hero"
  target.search = ""
  return NextResponse.redirect(target)
}

export function GET(request: Request) {
  return redirectToHero(request)
}

export function POST(request: Request) {
  return redirectToHero(request)
}
