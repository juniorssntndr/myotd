import { mkdir, unlink } from "node:fs/promises"
import path from "node:path"
import { NextRequest, NextResponse } from "next/server"
import sharp from "sharp"

import { requireAdmin } from "@/lib/api-auth"
import {
  getProductUploadRoot,
  publicUploadPath,
  relativePathFromPublicUploadPath,
  safeJoinProductUploadPath,
} from "@/lib/upload-paths"

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"])

function hasAllowedImageSignature(input: Buffer) {
  const isJpeg = input.length >= 3 && input[0] === 0xff && input[1] === 0xd8 && input[2] === 0xff
  const isPng =
    input.length >= 8 &&
    input[0] === 0x89 &&
    input[1] === 0x50 &&
    input[2] === 0x4e &&
    input[3] === 0x47 &&
    input[4] === 0x0d &&
    input[5] === 0x0a &&
    input[6] === 0x1a &&
    input[7] === 0x0a
  const isWebp =
    input.length >= 12 &&
    input.subarray(0, 4).toString("ascii") === "RIFF" &&
    input.subarray(8, 12).toString("ascii") === "WEBP"

  return isJpeg || isPng || isWebp
}

function safeBaseName(name: string) {
  return name
    .replace(/\.[^.]+$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "product-image"
}

function uniqueFileName(file: File, extension: string) {
  const suffix = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`
  return `${safeBaseName(file.name)}-${suffix}.${extension}`
}

export async function POST(request: NextRequest) {
  try {
    const { response } = await requireAdmin()
    if (response) return response

    if (request.headers.has("content-length")) {
      const contentLength = Number(request.headers.get("content-length"))
      if (Number.isFinite(contentLength) && contentLength > MAX_UPLOAD_BYTES + 1024 * 1024) {
        return NextResponse.json({ error: "La imagen no debe superar 5MB" }, { status: 413 })
      }
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Archivo requerido" }, { status: 400 })
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Formato no permitido. Usa JPG, PNG o WebP." },
        { status: 400 }
      )
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "La imagen no debe superar 5MB" }, { status: 400 })
    }

    const uploadRoot = getProductUploadRoot()
    await mkdir(uploadRoot, { recursive: true })

    const input = Buffer.from(await file.arrayBuffer())
    if (!hasAllowedImageSignature(input)) {
      return NextResponse.json({ error: "El archivo no es una imagen válida" }, { status: 400 })
    }

    const fileName = uniqueFileName(file, "webp")
    const target = path.join(uploadRoot, fileName)

    await sharp(input)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(target)

    return NextResponse.json({ path: publicUploadPath(fileName) }, { status: 201 })
  } catch (error) {
    console.error("Error uploading product image:", error)
    return NextResponse.json({ error: "No se pudo subir la imagen" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { response } = await requireAdmin()
    if (response) return response

    const { searchParams } = new URL(request.url)
    const publicPath = searchParams.get("path") || ""
    const relativePath = relativePathFromPublicUploadPath(publicPath)

    if (!relativePath) {
      return NextResponse.json({ error: "Ruta de imagen inválida" }, { status: 400 })
    }

    const target = safeJoinProductUploadPath(relativePath)
    if (!target) {
      return NextResponse.json({ error: "Ruta de imagen inválida" }, { status: 400 })
    }

    await unlink(target).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== "ENOENT") throw error
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product image:", error)
    return NextResponse.json({ error: "No se pudo eliminar la imagen" }, { status: 500 })
  }
}
