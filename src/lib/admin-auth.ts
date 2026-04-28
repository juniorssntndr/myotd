import { redirect } from "next/navigation"

import { auth } from "@/lib/auth"

export async function requireAdminPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  if (session.user.role !== "ADMIN") {
    redirect("/")
  }

  return session
}
