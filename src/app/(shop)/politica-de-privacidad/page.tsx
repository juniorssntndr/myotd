import type { Metadata } from "next"
import { LegalPageLayout } from "@/components/legal/LegalPageLayout"
import { LEGAL_UPDATED_AT, privacySections } from "@/data/legal-content"

export const metadata: Metadata = {
  title: "Política de Privacidad | Myotd",
  description: "Política de privacidad y protección de datos personales de Myotd.",
}

export default function PrivacyPage() {
  return (
    <LegalPageLayout
      title="Política de Privacidad"
      updatedAt={LEGAL_UPDATED_AT}
      sections={privacySections}
    />
  )
}
