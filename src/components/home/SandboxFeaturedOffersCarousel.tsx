"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Autoplay from "embla-carousel-autoplay"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"
import type { FeaturedOfferCard } from "@/components/home/SandboxFeaturedOffersSection"

function getSlidesPerView(width: number): number {
  if (width >= 1024) return 3
  if (width >= 640) return 1.6
  return 1.1
}

/** Enough slides for Embla loop + drag when showing up to 3 at once on desktop */
function buildLoopSlides(offers: FeaturedOfferCard[]): FeaturedOfferCard[] {
  if (offers.length === 0) return []
  const target = Math.max(18, offers.length * 4)
  const out: FeaturedOfferCard[] = []
  for (let i = 0; i < target; i++) {
    const base = offers[i % offers.length]
    out.push({ ...base, id: `${base.id}__${i}` })
  }
  return out
}

function slideFlexBasis(slidesPerView: number): string {
  const n = Math.min(Math.max(slidesPerView, 1), 3)
  const gapRem = 0.75
  const gaps = Math.max(0, Math.ceil(n) - 1)
  if (Number.isInteger(n) && n >= 2) {
    return `calc((100% - ${gaps * gapRem}rem) / ${n})`
  }
  return `${(100 / slidesPerView).toFixed(3)}%`
}

function OfferItem({ offer }: { offer: FeaturedOfferCard }) {
  return (
    <motion.article
      suppressHydrationWarning
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-6%" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group relative min-h-[280px] overflow-hidden rounded-2xl border border-border/60 shadow-sm sm:min-h-[300px] lg:min-h-[300px]"
    >
      {/* Capas bajo el texto: sin mix-blend primero = siempre visible (prueba agresiva de contraste). */}
      <div className="absolute inset-0 isolate overflow-hidden rounded-2xl">
        <Image
          src={offer.image}
          alt={offer.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 55vw, 90vw"
          className="object-cover brightness-[0.82] saturate-[1.12] contrast-[1.05] transition-[transform,filter] duration-500 group-hover:scale-105 group-hover:brightness-[0.9] group-hover:saturate-[1.2]"
        />
        {/* Diagnóstico: degradado muy fuerte (sin blend) — si esto no se ve, el problema no es la opacidad sino el stacking/contexto */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-br from-fuchsia-600/80 via-amber-500/75 to-cyan-500/80"
        />
        {/* Matiz por oferta encima del diagnóstico */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 z-[1] bg-gradient-to-br ${offer.tone} opacity-[0.55]`}
        />
        {/* Oscurecimiento fuerte para texto */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-black/[0.92] via-black/50 to-black/15"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_115%_75%_at_50%_100%,rgb(0_0_0_/_0.62),transparent_55%)]"
        />
      </div>

      <div className="relative z-10 flex h-full min-h-[inherit] flex-col justify-end gap-1 p-5 sm:p-6 sm:gap-1.5">
        <span className="mb-1 inline-flex w-fit rounded-full border border-white/70 bg-white/15 px-3 py-1.5 text-sm font-bold uppercase tracking-wide text-white backdrop-blur-sm sm:text-base">
          {offer.discount}
        </span>
        <h3 className="text-2xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
          {offer.title}
        </h3>
        <p className="mt-1 line-clamp-3 max-w-full text-base font-normal leading-snug text-white sm:text-lg">
          {offer.subtitle}
        </p>
        <Link
          suppressHydrationWarning
          href={offer.href}
          className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-white bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:mt-3.5 sm:text-sm sm:py-2"
        >
          Ver ofertas
          <span className="inline-flex shrink-0" suppressHydrationWarning>
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </div>
    </motion.article>
  )
}

export function SandboxFeaturedOffersCarousel({ offers }: { offers: FeaturedOfferCard[] }) {
  const slides = React.useMemo(() => buildLoopSlides(offers), [offers])
  const [slidesPerView, setSlidesPerView] = React.useState(3)
  const [api, setApi] = React.useState<CarouselApi | null>(null)

  React.useLayoutEffect(() => {
    setSlidesPerView(getSlidesPerView(window.innerWidth))
  }, [])

  React.useEffect(() => {
    const onResize = () => setSlidesPerView(getSlidesPerView(window.innerWidth))
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  const plugin = React.useRef(
    Autoplay({
      delay: 3200,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  )

  const flexBasis = React.useMemo(() => slideFlexBasis(slidesPerView), [slidesPerView])

  React.useEffect(() => {
    if (!api) return
    const id = window.requestAnimationFrame(() => {
      api.reInit()
    })
    return () => window.cancelAnimationFrame(id)
  }, [api, slides, slidesPerView, flexBasis])

  if (slides.length === 0) {
    return null
  }

  return (
    <Carousel
      setApi={setApi}
      plugins={[plugin.current]}
      opts={{
        align: "start",
        loop: true,
        dragFree: false,
      }}
      className="w-full"
    >
      <CarouselContent className="!-ml-2.5 lg:!-ml-3">
        {slides.map((offer) => (
          <CarouselItem
            key={offer.id}
            className="min-w-0 !basis-auto shrink-0 grow-0 !pl-2.5 lg:!pl-3"
            style={{ flex: `0 0 ${flexBasis}` }}
          >
            <OfferItem offer={offer} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
