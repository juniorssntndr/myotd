import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"

type Params = Promise<{ brandId: string }>

export async function DELETE(
  _request: Request,
  { params }: { params: Params }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { brandId } = await params

    await prisma.favoriteBrand.deleteMany({
      where: {
        userId: session.user.id,
        brandId,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting favorite brand:", error)
    return NextResponse.json({ error: "Error deleting favorite brand" }, { status: 500 })
  }
}
