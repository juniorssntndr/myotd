// WhatsApp utility for pre-configured messages by context
import type { WhatsAppContext } from "@/types"

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "51999999999"

export function getWhatsAppUrl(context: WhatsAppContext): string {
  const baseUrl = `https://wa.me/${WHATSAPP_NUMBER}`

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
