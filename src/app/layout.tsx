import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
