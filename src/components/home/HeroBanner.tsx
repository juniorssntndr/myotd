"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import Autoplay from "embla-carousel-autoplay"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import {
  type HomeHeroVisual,
  resolveHeroAccentClass,
  defaultHomeVisual,
  resolveHeroGradientClass,
  resolveHeroGlowClass,
  resolveHeroTintClass,
} from "@/lib/home-visual"
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

type HeroBannerProps = {
  visual?: HomeHeroVisual
}

export function HeroBanner({ visual = defaultHomeVisual.hero }: HeroBannerProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  )
  const [api, setApi] = React.useState<CarouselApi | null>(null)
  const [currentIndex, setCurrentIndex] = React.useState(0)

  React.useEffect(() => {
    if (!api) {
      return
    }

    const updateCurrentIndex = () => {
      setCurrentIndex(api.selectedScrollSnap())
    }

    updateCurrentIndex()
    api.on("select", updateCurrentIndex)
    api.on("reInit", updateCurrentIndex)

    return () => {
      api.off("select", updateCurrentIndex)
      api.off("reInit", updateCurrentIndex)
    }
  }, [api])

  return (
    <section className="relative">
      <Carousel
        setApi={setApi}
        plugins={[plugin.current]}
        className="w-full"
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>
          {visual.slides.map((slide) => {
            const hasCustomColors = slide.customColors?.useCustom;
            const customGradient = slide.customColors?.gradient;
            const customTint = slide.customColors?.tint;
            const typography = slide.typography;

            // Compute background styles
            const gradientStyle: React.CSSProperties = hasCustomColors && customGradient 
              ? { backgroundImage: `linear-gradient(to bottom right, ${customGradient.from}, ${customGradient.via ?? customGradient.from}, ${customGradient.to})` }
              : {};
            
            const tintStyle: React.CSSProperties = hasCustomColors && customTint
              ? { 
                  backgroundImage: `linear-gradient(to right, ${customTint.from}, ${customTint.via ?? customTint.from}, ${customTint.to})`,
                  opacity: visual.tintOpacity / 100 
                }
              : { opacity: visual.tintOpacity / 100 };

            // Compute glow style (derived from tint or custom tint)
            const glowStyle: React.CSSProperties = hasCustomColors && customTint
              ? { backgroundImage: `linear-gradient(to right, ${customTint.from}4D, ${customTint.via ?? customTint.from}33, transparent)` }
              : {};

            return (
              <CarouselItem key={slide.id}>
                <div 
                  className={`relative overflow-hidden ${!hasCustomColors ? `bg-gradient-to-br ${resolveHeroGradientClass(slide.gradient)}` : ""}`}
                  style={gradientStyle}
                >
                  {/* Background Image */}
                  <div
                    className="absolute inset-0"
                    style={{ opacity: visual.imageOpacity / 100 }}
                  >
                    <Image
                      src={slide.image}
                      alt=""
                      fill
                      className="object-cover"
                      priority={slide.id === 1}
                    />
                  </div>

                  <div
                    className={`absolute inset-0 ${!hasCustomColors ? `bg-gradient-to-r ${resolveHeroTintClass(slide.overlayTint)}` : ""}`}
                    style={tintStyle}
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-black/0 via-black/0 to-black/0"
                    style={{
                      backgroundImage: `linear-gradient(to right, rgb(0 0 0 / ${visual.sideShadeOpacity}%), transparent, rgb(0 0 0 / ${visual.sideShadeOpacity}%))`,
                    }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `radial-gradient(80% 70% at 50% 50%, rgba(255,255,255,${visual.radialHighlightOpacity / 100}) 0%, rgba(0,0,0,${visual.radialShadowOpacity / 100}) 100%)`,
                    }}
                  />

                  {/* Content */}
                  <div className="container mx-auto px-4 py-14 sm:py-16 lg:py-20 xl:py-24">
                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
                      {/* Text Content */}
                      <div className="max-w-xl text-center lg:max-w-2xl lg:text-left">
                        <motion.span
                          initial={{ opacity: 0, y: 12 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          viewport={{ once: false, margin: "-20%" }}
                          className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm"
                        >
                          {slide.badge}
                        </motion.span>
                        <motion.h2
                          initial={{ opacity: 0, y: 18 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.45, ease: "easeOut", delay: 0.06 }}
                          viewport={{ once: false, margin: "-20%" }}
                          className={`text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl xl:text-6xl ${typography?.titleFont ?? ""}`}
                          style={{ color: typography?.titleColor ?? "#ffffff" }}
                        >
                          {slide.title}
                          <span 
                            className={`block ${!typography?.subtitleColor ? resolveHeroAccentClass(slide.gradient) : ""}`}
                            style={{ color: typography?.subtitleColor }}
                          >
                            {slide.subtitle}
                          </span>
                        </motion.h2>
                        <motion.p
                          initial={{ opacity: 0, y: 16 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.42, ease: "easeOut", delay: 0.12 }}
                          viewport={{ once: false, margin: "-20%" }}
                          className="mt-3 max-w-md text-sm text-slate-300 sm:text-base lg:mx-0"
                        >
                          {slide.description}
                        </motion.p>
                        <motion.div
                          initial={{ opacity: 0, y: 14 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, ease: "easeOut", delay: 0.18 }}
                          viewport={{ once: false, margin: "-20%" }}
                          className="mt-5 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start"
                        >
                          <Button asChild size="default" className="bg-white text-black hover:bg-slate-200">
                            <Link href={slide.href}>{slide.cta}</Link>
                          </Button>
                          <Button asChild variant="outline" className="bg-transparent border-white/40 text-white hover:bg-white/10 hover:text-white">
                            <Link href="/products">Ver Todo</Link>
                          </Button>
                        </motion.div>
                      </div>

                      {/* Visual Element */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 12 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                        viewport={{ once: false, margin: "-20%" }}
                        className="relative h-52 w-72 sm:h-72 sm:w-96 lg:h-[360px] lg:w-[540px] xl:h-[400px] xl:w-[600px]"
                      >
                        <div
                          className={`absolute inset-0 rounded-full blur-3xl ${!hasCustomColors ? `bg-gradient-to-r ${resolveHeroGlowClass(slide.overlayTint)}` : ""}`}
                          style={glowStyle}
                        />
                        <div className="relative h-full rounded-2xl overflow-hidden shadow-2xl">
                          <Image
                            src={slide.image}
                            alt={slide.title}
                            fill
                            sizes="(min-width: 1024px) 540px, (min-width: 640px) 384px, 288px"
                            className="object-cover rounded-2xl"
                          />
                        </div>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>

        {/* Navigation Arrows */}
        <CarouselPrevious className="left-4 hidden sm:flex" />
        <CarouselNext className="right-4 hidden sm:flex" />

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {visual.slides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Ir al slide ${index + 1}`}
              aria-pressed={currentIndex === index}
              onClick={() => api?.scrollTo(index)}
              className={
                currentIndex === index
                  ? "h-1.5 w-8 rounded-full bg-white transition-all"
                  : "h-1.5 w-6 rounded-full bg-white/30 transition-colors"
              }
            />
          ))}
        </div>
      </Carousel>
    </section>
  )
}
