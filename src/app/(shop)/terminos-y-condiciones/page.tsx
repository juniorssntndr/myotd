import type { Metadata } from "next"
import { LegalPageLayout } from "@/components/legal/LegalPageLayout"
import { LEGAL_UPDATED_AT, termsSections } from "@/data/legal-content"

export const metadata: Metadata = {
  title: "Términos y Condiciones | Myotd",
  description: "Términos y condiciones de uso y compra en Myotd.",
}

export default function TermsPage() {
  return (
    <LegalPageLayout
      title="Términos y Condiciones"
      updatedAt={LEGAL_UPDATED_AT}
      sections={termsSections}
    />
  )
}
