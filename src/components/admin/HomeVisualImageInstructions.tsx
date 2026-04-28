import { Info } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

type HomeVisualImageInstructionsProps = {
  className?: string
  title?: string
}

export function HomeVisualImageInstructions({
  className,
  title = "Instrucciones rápidas para imágenes",
}: HomeVisualImageInstructionsProps) {
  return (
    <Alert className={className}>
      <Info className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        <p>
          Usá solo URLs de hosts permitidos: <strong>images.unsplash.com</strong>, <strong>cdn.jsdelivr.net</strong>, <strong>res.cloudinary.com</strong> y <strong>69efe44900fff4c9787203ec.imgix.net</strong>.
        </p>
        <p>
          Si la imagen sale de Imgix, copiá la <strong>URL completa</strong> desde <strong>Asset Details → URL</strong>. También podés usar una ruta local como <strong>/hero/mi-banner.jpg</strong> si el archivo está dentro de <strong>public/</strong>.
        </p>
      </AlertDescription>
    </Alert>
  )
}
