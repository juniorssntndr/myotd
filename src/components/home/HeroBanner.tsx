"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import Autoplay from "embla-carousel-autoplay"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

const slides = [
  {
    id: 1,
    badge: "Nueva Colección",
    title: "Streetwear 2026",
    subtitle: "Tu Estilo, Tu Ciudad",
    description: "Nike, Adidas, Converse, Puma, New Balance y Zara en una selección urbana curada",
    cta: "Ver Catálogo",
    href: "/products",
    gradient: "from-red-900 via-rose-900 to-slate-900",
    overlayTint: "from-red-500/70 via-rose-500/60 to-orange-400/50",
    image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=800",
  },
  {
    id: 2,
    badge: "Hasta 40% OFF",
    title: "Zapatillas",
    subtitle: "Las Más Buscadas",
    description: "Nike, Adidas, Converse, New Balance y Puma. Envío a todo el Perú",
    cta: "Ver Ofertas",
    href: "/products?category=zapatillas",
    gradient: "from-rose-900 via-pink-900 to-slate-900",
    overlayTint: "from-fuchsia-500/70 via-pink-500/65 to-rose-500/55",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
  },
  {
    id: 3,
    badge: "Bestseller",
    title: "Hoodies & Polos",
    subtitle: "Comodidad Total",
    description: "Prendas versátiles para tu día a día. Calidad premium",
    cta: "Explorar",
    href: "/products?category=hoodies",
    gradient: "from-rose-800 via-slate-900 to-slate-900",
    overlayTint: "from-rose-400/60 via-violet-500/55 to-slate-500/60",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800",
  },
]

export function HeroBanner() {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  )

  return (
    <section className="relative">
      <Carousel
        plugins={[plugin.current]}
        className="w-full"
        opts={{
          loop: true,
        }}
      >
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <div className={`relative overflow-hidden bg-gradient-to-br ${slide.gradient}`}>
                {/* Background Image */}
                <div className="absolute inset-0 opacity-60">
                  <Image
                    src={slide.image}
                    alt=""
                    fill
                    className="object-cover"
                    priority={slide.id === 1}
                  />
                </div>

                <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlayTint}`} />
                <div className="absolute inset-0 bg-gradient-to-r from-black/18 via-black/0 to-black/18" />
                <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_50%,rgba(255,255,255,0.08)_0%,rgba(0,0,0,0.16)_100%)]" />

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
                        className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl xl:text-6xl"
                      >
                        {slide.title}
                        <span className="block text-rose-400">{slide.subtitle}</span>
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
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 blur-3xl rounded-full" />
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
          ))}
        </CarouselContent>

        {/* Navigation Arrows */}
        <CarouselPrevious className="left-4 hidden sm:flex" />
        <CarouselNext className="right-4 hidden sm:flex" />

        {/* Dots Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <div
              key={index}
              className="h-1.5 w-6 rounded-full bg-white/30 transition-colors"
            />
          ))}
        </div>
      </Carousel>
    </section>
  )
}
