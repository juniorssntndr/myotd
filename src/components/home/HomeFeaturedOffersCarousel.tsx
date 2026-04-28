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
} from "@/components/ui/carousel"
import type { HomeFeaturedOfferCard } from "@/lib/home-featured-offers.shared"
import { offerToneClassForKey } from "@/lib/home-featured-offers.shared"
import { type HomeFeaturedOffersVisual, defaultHomeVisual } from "@/lib/home-visual"

function ensureLoopableOffers(offers: HomeFeaturedOfferCard[]): HomeFeaturedOfferCard[] {
  if (offers.length <= 1 || offers.length > 3) {
    return offers
  }

  const duplicatesNeeded = 6 - offers.length
  const duplicates = Array.from({ length: duplicatesNeeded }, (_, index) => {
    const base = offers[index % offers.length]

    return {
      ...base,
      id: `${base.id}__loop_${index + 1}`,
    }
  })

  return [...offers, ...duplicates]
}

function OfferItem({
  offer,
  visual,
}: {
  offer: HomeFeaturedOfferCard
  visual: HomeFeaturedOffersVisual
}) {
  return (
    <motion.article
      suppressHydrationWarning
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-6%" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group relative h-[220px] overflow-hidden rounded-2xl border border-border/60 shadow-sm sm:h-[232px] lg:h-[248px]"
    >
      <div className="absolute inset-0 isolate overflow-hidden rounded-2xl">
        <Image
          src={offer.image}
          alt={offer.title}
          fill
          sizes="(min-width: 1280px) 30vw, (min-width: 1024px) 33vw, (min-width: 640px) 52vw, 88vw"
          className="object-cover brightness-[0.8] saturate-[1.1] contrast-[1.02] transition-[transform,filter] duration-500 group-hover:scale-105 group-hover:brightness-[0.88] group-hover:saturate-[1.18]"
        />
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-0 z-[1] bg-gradient-to-br ${offerToneClassForKey(offer.toneKey)}`}
          style={{ opacity: visual.toneOpacity / 100 }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[2]"
          style={{
            backgroundImage: `linear-gradient(to top, rgb(0 0 0 / ${visual.darkFromOpacity}%), rgb(0 0 0 / ${visual.darkViaOpacity}%), rgb(0 0 0 / ${visual.darkToOpacity}%))`,
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[2]"
          style={{
            backgroundImage: `radial-gradient(ellipse 115% 75% at 50% 100%, rgb(0 0 0 / ${visual.radialDarkOpacity}%), transparent 55%)`,
          }}
        />
      </div>

      <div className="relative z-10 flex h-full flex-col justify-end gap-1.5 p-4 sm:p-5">
        <span className="inline-flex w-fit rounded-full border border-white/70 bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white backdrop-blur-sm sm:text-sm">
          {offer.discount}
        </span>
        <h3 className="line-clamp-2 text-xl font-bold leading-tight tracking-tight text-white sm:text-2xl">
          {offer.title}
        </h3>
        <p className="line-clamp-2 max-w-full text-sm font-normal leading-snug text-white/90 sm:text-[15px]">
          {offer.subtitle}
        </p>
        <Link
          suppressHydrationWarning
          href={offer.href}
          className="mt-1 inline-flex w-fit items-center gap-1.5 rounded-full border border-white bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
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

export function HomeFeaturedOffersCarousel({
  offers,
  visual = defaultHomeVisual.featuredOffers,
}: {
  offers: HomeFeaturedOfferCard[]
  visual?: HomeFeaturedOffersVisual
}) {
  const loopableOffers = React.useMemo(() => ensureLoopableOffers(offers), [offers])

  const plugin = React.useRef(
    Autoplay({
      delay: 3200,
      stopOnInteraction: false,
      stopOnMouseEnter: true,
    })
  )

  if (loopableOffers.length === 0) {
    return null
  }

  return (
    <Carousel
      plugins={[plugin.current]}
      opts={{
        align: "start",
        loop: loopableOffers.length > 3,
        dragFree: false,
      }}
      className="w-full"
    >
      <CarouselContent className="!-ml-2.5 lg:!-ml-3">
        {loopableOffers.map((offer) => (
          <CarouselItem
            key={offer.id}
            className="min-w-0 basis-[88%] !pl-2.5 sm:basis-[calc((100%-0.75rem)/1.6)] lg:basis-[calc((100%-1.5rem)/3)] lg:!pl-3"
          >
            <OfferItem offer={offer} visual={visual} />
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
