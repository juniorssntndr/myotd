import type { Metadata } from "next"
import { LegalPageLayout } from "@/components/legal/LegalPageLayout"
import { LEGAL_UPDATED_AT, returnsSections } from "@/data/legal-content"

export const metadata: Metadata = {
  title: "Cambios y Devoluciones | Myotd",
  description: "Política de cambios, devoluciones y reembolsos de Myotd.",
}

export default function ReturnsPage() {
  return (
    <LegalPageLayout
      title="Política de Cambios y Devoluciones"
      updatedAt={LEGAL_UPDATED_AT}
      sections={returnsSections}
    />
  )
}
