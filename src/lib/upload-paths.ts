import path from "node:path"

export const PRODUCT_UPLOAD_SEGMENT = "products"
export const PRODUCT_UPLOAD_PUBLIC_PREFIX = `/uploads/${PRODUCT_UPLOAD_SEGMENT}`

export function getUploadRoot() {
  return path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads"))
}

export function getProductUploadRoot() {
  return path.join(getUploadRoot(), PRODUCT_UPLOAD_SEGMENT)
}

export function safeJoinProductUploadPath(relativePath: string) {
  const uploadRoot = getProductUploadRoot()
  const normalized = relativePath.replace(/^[/\\]+/, "")
  const target = path.resolve(uploadRoot, normalized)
  const relative = path.relative(uploadRoot, target)

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return null
  }

  return target
}

export function publicUploadPath(fileName: string) {
  return `${PRODUCT_UPLOAD_PUBLIC_PREFIX}/${fileName}`
}

export function relativePathFromPublicUploadPath(publicPath: string) {
  if (!publicPath.startsWith(`${PRODUCT_UPLOAD_PUBLIC_PREFIX}/`)) {
    return null
  }

  return publicPath.slice(PRODUCT_UPLOAD_PUBLIC_PREFIX.length + 1)
}
