"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import Autoplay from "embla-carousel-autoplay"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { cn } from "@/lib/utils"

export type HomeSponsoredItem = {
  id: string
  href: string
  image: string
  logo?: string | null
  brandName: string
  categoryName: string
  promo: string
  showStoreBadge: boolean
}

type HomeSponsoredCarouselProps = {
  items: HomeSponsoredItem[]
}

export function HomeSponsoredCarousel({ items }: HomeSponsoredCarouselProps) {
  const [slidesPerView, setSlidesPerView] = React.useState(1)

  React.useEffect(() => {
    const updateSlidesPerView = () => {
      const width = window.innerWidth

      if (width >= 1200) {
        setSlidesPerView(5)
        return
      }

      if (width >= 1024) {
        setSlidesPerView(3)
        return
      }

      if (width >= 640) {
        setSlidesPerView(2)
        return
      }

      setSlidesPerView(1.15)
    }

    updateSlidesPerView()
    window.addEventListener("resize", updateSlidesPerView)

    return () => {
      window.removeEventListener("resize", updateSlidesPerView)
    }
  }, [])

  const isCompactDesktop = slidesPerView >= 5
  const itemBasis = `${100 / slidesPerView}%`
  const imageSizes =
    slidesPerView >= 5
      ? "(min-width: 1200px) 20vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 88vw"
      : "(min-width: 1200px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 88vw"

  const plugin = React.useRef(
    Autoplay({
      delay: 2500,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
    })
  )

  return (
    <Carousel
      plugins={[plugin.current]}
      opts={{ align: "start", loop: items.length > 1 }}
      className="w-full"
    >
      <CarouselContent>
        {items.map((item, index) => (
          <CarouselItem
            key={item.id}
            className="pl-4"
            style={{ flex: `0 0 ${itemBasis}` }}
          >
            <motion.div
              initial={{ opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              viewport={{ once: false, margin: "-40px" }}
            >
              <Link href={item.href} className="group block">
                <div className="relative overflow-hidden rounded-[28px] bg-[#9a795a]">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.categoryName}
                      fill
                      sizes={imageSizes}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-black/10" />

                    {item.showStoreBadge ? (
                      <span className="absolute right-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-black shadow-sm">
                        In Store
                      </span>
                    ) : null}

                    <div
                      className={cn(
                        "absolute inset-0 flex items-center justify-center p-8",
                        isCompactDesktop && "p-6"
                      )}
                    >
                      {item.logo ? (
                        <Image
                          src={item.logo}
                          alt={item.brandName}
                          width={220}
                          height={96}
                          unoptimized
                          className={cn(
                            "h-auto max-h-20 w-auto max-w-[200px] object-contain brightness-0 invert drop-shadow-[0_6px_18px_rgba(0,0,0,0.45)]",
                            isCompactDesktop && "max-h-16 max-w-[160px]"
                          )}
                        />
                      ) : (
                        <span
                          className={cn(
                            "text-3xl font-black uppercase tracking-tight text-white drop-shadow-md",
                            isCompactDesktop && "text-2xl"
                          )}
                        >
                          {item.brandName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div
                  className={cn(
                    "mt-4 flex items-start justify-between gap-4",
                    isCompactDesktop && "mt-3 gap-3"
                  )}
                >
                  <div className="min-w-0">
                    <h3
                      className={cn(
                        "truncate text-xl font-semibold tracking-tight text-foreground",
                        isCompactDesktop && "text-lg"
                      )}
                    >
                      {item.brandName}
                    </h3>
                    <p className="mt-1 truncate text-sm text-muted-foreground">
                      {item.categoryName}
                    </p>
                  </div>

                  <span
                    className={cn(
                      "pt-1 text-sm font-medium text-foreground/80 whitespace-nowrap",
                      isCompactDesktop && "text-xs"
                    )}
                  >
                    {item.promo}
                  </span>
                </div>
              </Link>
            </motion.div>
          </CarouselItem>
        ))}
      </CarouselContent>
    </Carousel>
  )
}
