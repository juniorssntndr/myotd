import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function requireAdmin() {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      session: null,
      response: NextResponse.json({ error: "No autorizado" }, { status: 401 }),
    }
  }

  if (session.user.role !== "ADMIN") {
    return {
      session: null,
      response: NextResponse.json({ error: "Prohibido" }, { status: 403 }),
    }
  }

  return {
    session,
    response: null,
  }
}
