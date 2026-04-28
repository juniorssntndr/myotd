// WhatsApp utility for pre-configured messages by context
import type { WhatsAppContext } from "@/types"

/** Digits-only fallback when no store phone or invalid value (env or placeholder). */
const FALLBACK_WHATSAPP_DIGITS =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") || "51999999999"

/**
 * Turns a human-entered phone (e.g. "+51 944 290 816", "944 290 816") into wa.me digits (country + national).
 */
export function phoneToWhatsAppDigits(raw: string): string | null {
  const d = raw.replace(/\D/g, "")
  if (!d) return null

  // Peru mobile: 51 + 9 digits (often starting with 9)
  if (d.startsWith("51") && d.length >= 11) {
    return d.slice(0, 11)
  }
  if (d.length === 9 && d.startsWith("9")) {
    return `51${d}`
  }

  if (d.length >= 10 && d.length <= 15) {
    return d
  }

  return null
}

export function getWhatsAppUrl(
  context: WhatsAppContext,
  storePhone?: string | null
): string {
  const fromSettings = storePhone?.trim()
    ? phoneToWhatsAppDigits(storePhone.trim())
    : null
  const waDigits = fromSettings ?? FALLBACK_WHATSAPP_DIGITS
  const baseUrl = `https://wa.me/${waDigits}`

  let message: string

  switch (context.type) {
    case "product":
      message = `Hola! Me interesa el producto: ${context.productName} (ID: ${context.productId})`
      break
    case "cart":
      message = "Hola! Tengo una consulta sobre mi carrito de compras"
      break
    case "order":
      message = `Hola! Tengo una consulta sobre mi pedido: ${context.orderId}`
      break
    case "support":
    default:
      message = "Hola! Me gustaría obtener más información sobre sus productos"
      break
  }

  const encodedMessage = encodeURIComponent(message)
  return `${baseUrl}?text=${encodedMessage}`
}
