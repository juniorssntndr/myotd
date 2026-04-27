const CULQI_PUBLIC_KEY = process.env.CULQI_PUBLIC_KEY
const CULQI_SECRET_KEY = process.env.CULQI_SECRET_KEY
const CULQI_API_URL = process.env.CULQI_API_URL || "https://api.culqi.com/v2"
const CULQI_CHECKOUT_URL = process.env.CULQI_CHECKOUT_URL || "https://checkout.culqi.com"

export interface CulqiPayment {
  id: string
  amount: number
  currency: "PEN"
  status: "pending" | "captured" | "refunded" | "failed"
  paymentMethod: "card" | "yape" | "plin" | "bank_transfer"
  orderNumber: string
}

export interface CreatePaymentParams {
  amount: number
  currency?: "PEN"
  description: string
  orderNumber: string
  email: string
  shippingAddress: {
    name: string
    phone: string
    address: string
    city: string
    district: string
  }
}

export interface PaymentResult {
  success: boolean
  payment?: CulqiPayment
  error?: string
  checkoutUrl?: string
  requiresManualConfirmation?: boolean
}

function buildManualConfirmationUrl(orderNumber: string) {
  const params = new URLSearchParams({
    status: "pending",
    order: orderNumber,
    fallback: "manual",
  })

  return `/checkout/success?${params.toString()}`
}

function shouldUseManualFallback(message: string) {
  return (
    message.includes("401") ||
    message.includes("403") ||
    message.includes("CULQI_PUBLIC_KEY") ||
    message.includes("CULQI_SECRET_KEY") ||
    message.includes("no configurado")
  )
}

async function culqiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (!CULQI_SECRET_KEY) {
    throw new Error("CULQI_SECRET_KEY no configurada")
  }

  const response = await fetch(`${CULQI_API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${CULQI_SECRET_KEY}`,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Unknown error" })) as { message?: string }
    throw new Error(error.message || `Culqi API error: ${response.status}`)
  }

  return response.json() as Promise<T>
}

type CulqiOrderResponse = {
  id: string
}

export async function createCulqiPayment(params: CreatePaymentParams): Promise<PaymentResult> {
  try {
    if (!CULQI_PUBLIC_KEY || !CULQI_SECRET_KEY) {
      return {
        success: true,
        checkoutUrl: buildManualConfirmationUrl(params.orderNumber),
        requiresManualConfirmation: true,
        error: "Culqi no configurado: se activo confirmacion manual",
      }
    }

    const amountInCents = Math.round(params.amount * 100)

    const orderPayload = {
      amount: amountInCents,
      currency_code: params.currency || "PEN",
      description: params.description,
      order_number: params.orderNumber,
      expiration_date: Math.floor(Date.now() / 1000) + 60 * 30,
      client_details: {
        first_name: params.shippingAddress.name.split(" ")[0] || "Cliente",
        last_name: params.shippingAddress.name.split(" ").slice(1).join(" ") || "Myotd",
        email: params.email,
        phone_number: params.shippingAddress.phone,
      },
      shipping_address: {
        country_code: "PE",
        state: params.shippingAddress.district,
        city: params.shippingAddress.city,
        address: params.shippingAddress.address,
      },
    }

    const order = await culqiRequest<CulqiOrderResponse>("/orders", {
      method: "POST",
      body: JSON.stringify(orderPayload),
    })

    const checkoutParams = new URLSearchParams({
      public_key: CULQI_PUBLIC_KEY,
      order_id: order.id,
    })

    return {
      success: true,
      payment: {
        id: order.id,
        amount: amountInCents,
        currency: "PEN",
        status: "pending",
        paymentMethod: "card",
        orderNumber: params.orderNumber,
      },
      checkoutUrl: `${CULQI_CHECKOUT_URL}?${checkoutParams.toString()}`,
    }
  } catch (error) {
    console.error("Error creating Culqi payment:", error)

    const message = error instanceof Error ? error.message : "Failed to create payment"

    if (shouldUseManualFallback(message)) {
      return {
        success: true,
        checkoutUrl: buildManualConfirmationUrl(params.orderNumber),
        requiresManualConfirmation: true,
        error: message,
      }
    }

    return {
      success: false,
      error: message,
    }
  }
}

type CulqiPaymentResponse = {
  id: string
  amount: number
  status: "pending" | "captured" | "refunded" | "failed"
  payment_method_type?: "card" | "yape" | "plin" | "bank_transfer"
  order_number?: string
}

export async function verifyPayment(paymentId: string): Promise<CulqiPayment | null> {
  try {
    const payment = await culqiRequest<CulqiPaymentResponse>(`/payments/${paymentId}`)

    return {
      id: payment.id,
      amount: payment.amount,
      currency: "PEN",
      status: payment.status,
      paymentMethod: payment.payment_method_type || "card",
      orderNumber: payment.order_number || "",
    }
  } catch (error) {
    console.error("Error verifying payment:", error)
    return null
  }
}

export async function refundPayment(paymentId: string): Promise<boolean> {
  try {
    await culqiRequest("/refunds", {
      method: "POST",
      body: JSON.stringify({
        charge_id: paymentId,
        reason: "requested_by_client",
      }),
    })

    return true
  } catch (error) {
    console.error("Error refunding payment:", error)
    return false
  }
}

export function getCulqiWebhookSecret(): string {
  return process.env.CULQI_WEBHOOK_SECRET || ""
}
