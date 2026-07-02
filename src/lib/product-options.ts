export const NO_SIZE_VALUE = "One Size"

export function isNoSizeValue(size: string | null | undefined) {
  return (size || "").trim().toLowerCase() === NO_SIZE_VALUE.toLowerCase()
}

export function productRequiresSize(categorySlug: string, sizes: string[]) {
  const uniqueSizes = sizes.filter((size) => size.trim().length > 0)
  if (categorySlug === "accesorios") return false
  return uniqueSizes.some((size) => !isNoSizeValue(size))
}

export function visibleProductSizes(categorySlug: string, sizes: string[]) {
  return productRequiresSize(categorySlug, sizes)
    ? sizes.filter((size) => !isNoSizeValue(size))
    : []
}

export function displayVariantSize(size: string | null | undefined) {
  return isNoSizeValue(size) ? "" : size || ""
}
