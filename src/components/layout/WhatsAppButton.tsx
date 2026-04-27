"use client"

import Link from "next/link"
import { MessageCircle } from "lucide-react"
import { getWhatsAppUrl } from "@/lib/whatsapp"

export function WhatsAppButton() {
  return (
    <Link
      href={getWhatsAppUrl({ type: "support" })}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#E11D48] text-white shadow-lg transition-transform hover:scale-110 hover:bg-[#E11D48]/90"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="sr-only">¿Necesitas ayuda?</span>
    </Link>
  )
}