import type { Metadata } from "next"
import { 
  Geist, 
  Geist_Mono, 
  Raleway, 
  Playfair_Display, 
  Montserrat, 
  Outfit, 
  Sacramento, 
  Lora, 
  Poppins, 
  Bebas_Neue 
} from "next/font/google"
import { Toaster } from "sonner"

import "./globals.css"
import "swiper/css"
import "swiper/css/autoplay"
import { ThemeProvider } from "@/components/providers/ThemeProvider"
import { SessionProvider } from "@/components/providers/SessionProvider"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const raleway = Raleway({
  variable: "--font-raleway",
  subsets: ["latin"],
})

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
})

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
})

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
})

const sacramento = Sacramento({
  variable: "--font-sacramento",
  subsets: ["latin"],
  weight: "400",
})

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
})

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
})

const bebas = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
})

export const metadata: Metadata = {
  title: "Myotd — Moda Urbana Multimarca Perú",
  description: "Tu estilo, tu ciudad. Encuentra las mejores marcas de moda urbana en un solo lugar. Envíos a todo el Perú.",
  openGraph: {
    title: "Myotd — Moda Urbana Multimarca Perú",
    description: "Tu estilo, tu ciudad. Encuentra las mejores marcas de moda urbana en un solo lugar.",
    url: "https://myotd.shop",
    siteName: "Myotd",
    locale: "es_PE",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          ${raleway.variable} 
          ${playfair.variable} 
          ${montserrat.variable} 
          ${outfit.variable} 
          ${sacramento.variable} 
          ${lora.variable} 
          ${poppins.variable} 
          ${bebas.variable} 
          antialiased
        `}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
