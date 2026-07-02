import { readFile, stat } from "node:fs/promises"
import { NextResponse } from "next/server"

import { safeJoinProductUploadPath } from "@/lib/upload-paths"

type Params = Promise<{ path: string[] }>

const CONTENT_TYPES: Record<string, string> = {
  webp: "image/webp",
}

export async function GET(
  _request: Request,
  { params }: { params: Params }
) {
  const { path } = await params
  const relativePath = path.join("/")
  const target = safeJoinProductUploadPath(relativePath)

  if (!target) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 })
  }

  try {
    const [file, metadata] = await Promise.all([readFile(target), stat(target)])
    const extension = relativePath.split(".").pop()?.toLowerCase() || ""

    return new Response(file, {
      status: 200,
      headers: {
        "Content-Type": CONTENT_TYPES[extension] || "application/octet-stream",
        "Content-Length": String(metadata.size),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch {
    return NextResponse.json({ error: "Image not found" }, { status: 404 })
  }
}
