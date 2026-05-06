const BROKEN_IMAGE_REPLACEMENTS: Record<string, string> = {
  "photo-1553062406-0b2dc83a5d32": "photo-1553062407-98eeb64c6a62",
  "photo-1620799140188-3b2a02fd87a8": "photo-1578681994506-b8f463449011",
}

export const IMGIX_HOST = "69efe44900fff4c9787203ec.imgix.net"
export const IMGIX_BASE_URL = `https://${IMGIX_HOST}`

export const ALLOWED_IMAGE_HOSTS = [
  "images.unsplash.com",
  "cdn.jsdelivr.net",
  "res.cloudinary.com",
  IMGIX_HOST,
]

function isAllowedHost(hostname: string) {
  return (
    ALLOWED_IMAGE_HOSTS.includes(hostname) ||
    hostname === "imgix.net" ||
    hostname.endsWith(".imgix.net")
  )
}

export function validateImageUrl(url: string): { valid: true } | { valid: false; error: string } {
  if (!url.trim()) {
    return { valid: false, error: "La URL no puede estar vacía" }
  }

  if (url.startsWith("/")) {
    return { valid: true }
  }

  try {
    const parsed = new URL(url)

    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return { valid: false, error: "Solo se permiten URLs con protocolo https:// o http://" }
    }

    if (!isAllowedHost(parsed.hostname)) {
      const allowed = [...ALLOWED_IMAGE_HOSTS.filter(h => h !== IMGIX_HOST), "cualquier cuenta de *.imgix.net"].join(", ")
      return { valid: false, error: `Host no permitido. Usá: ${allowed}` }
    }

    return { valid: true }
  } catch {
    return { valid: false, error: "URL inválida" }
  }
}

function isAbsoluteUrl(value: string) {
  return /^https?:\/\//i.test(value)
}

export function sanitizeImageUrl(url: string) {
  let safeUrl = url

  for (const [brokenId, replacementId] of Object.entries(BROKEN_IMAGE_REPLACEMENTS)) {
    if (safeUrl.includes(brokenId)) {
      safeUrl = safeUrl.replace(brokenId, replacementId)
    }
  }

  return safeUrl
}

export function normalizeProductImageInput(image: string) {
  const value = image.trim()

  if (!value) {
    return ""
  }

  if (value.startsWith("/")) {
    return value
  }

  if (isAbsoluteUrl(value)) {
    try {
      const parsed = new URL(value)

      if (parsed.hostname === IMGIX_HOST) {
        return decodeURIComponent(parsed.pathname.replace(/^\/+/, ""))
      }

      return sanitizeImageUrl(value)
    } catch {
      return sanitizeImageUrl(value)
    }
  }

  return value.replace(/^\/+/, "")
}

export function resolveProductImageUrl(image: string) {
  const value = image.trim()

  if (!value) {
    return ""
  }

  if (value.startsWith("/") || isAbsoluteUrl(value)) {
    return sanitizeImageUrl(value)
  }

  return sanitizeImageUrl(`${IMGIX_BASE_URL}/${value.replace(/^\/+/, "")}`)
}

export function normalizeProductImageList(images: string[] | null | undefined) {
  if (!Array.isArray(images)) {
    return []
  }

  return images
    .map((image) => normalizeProductImageInput(image))
    .filter((image) => image.length > 0)
}

export function resolveProductImageList(images: string[] | null | undefined) {
  if (!Array.isArray(images)) {
    return []
  }

  return images
    .map((image) => resolveProductImageUrl(image))
    .filter((image) => image.length > 0)
}

export const sanitizeImageList = resolveProductImageList

export function validateImageUrlForSave(url: string): string | null {
  if (!url.trim()) return null
  const result = validateImageUrl(url)
  return result.valid ? null : result.error
}
