import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

type LegalSection = {
  title: string
  paragraphs: string[]
}

type LegalPageLayoutProps = {
  title: string
  updatedAt: string
  sections: LegalSection[]
}

export function LegalPageLayout({ title, updatedAt, sections }: LegalPageLayoutProps) {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      <Button variant="ghost" asChild className="-ml-2 mb-6">
        <Link href="/">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Volver al inicio
        </Link>
      </Button>

      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Última actualización: {updatedAt}</p>

      <div className="mt-8 space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <div className="mt-3 space-y-3 text-muted-foreground">
              {section.paragraphs.map((paragraph, index) => (
                <p key={`${section.title}-${index}`}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-10 rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        <p>
          Para consultas sobre estas políticas escríbenos a{" "}
          <a href="mailto:info@myotd.pe" className="text-foreground underline">
            info@myotd.pe
          </a>{" "}
          o utiliza nuestro{" "}
          <a
            href="https://www.librovirtual.pe/r/carta-oblitas-santiago-cristhian"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline"
          >
            Libro de Reclamaciones
          </a>
          .
        </p>
      </div>
    </div>
  )
}
