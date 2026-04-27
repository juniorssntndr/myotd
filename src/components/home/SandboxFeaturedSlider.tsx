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
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"

export type SandboxFeaturedItem = {
  id: string
  slug: string
  name: string
  image: string
  saleTitle?: string
  price?: string
  originalPrice?: string
  reviewCount?: string
}

type SandboxFeaturedSliderProps = {
  items?: SandboxFeaturedItem[]
  slidesPerView?: number
  spaceBetween?: number
  autoplayDelay?: number
}

const DEFAULT_ITEMS: SandboxFeaturedItem[] = [
  {
    id: "1",
    slug: "/products",
    name: "Cozy Knit Cardigan Sweater",
    image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=300&h=330&fit=crop",
    saleTitle: "Up to 40% Off",
    price: "$80",
    originalPrice: "$95",
    reviewCount: "2k",
  },
  {
    id: "2",
    slug: "/products",
    name: "Sophisticated Swagger Suit",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=330&fit=crop",
    saleTitle: "Up to 40% Off",
    price: "$120",
    originalPrice: "$180",
    reviewCount: "800",
  },
  {
    id: "3",
    slug: "/products",
    name: "Classic Denim Skinny Jeans",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=330&fit=crop",
    saleTitle: "Buy 2 Get 1 Free",
    price: "$45",
    originalPrice: "$65",
    reviewCount: "3k",
  },
  {
    id: "4",
    slug: "/products",
    name: "Vintage Leather Bomber Jacket",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=330&fit=crop",
    saleTitle: "Min. 30% Off",
    price: "$95",
    originalPrice: "$130",
    reviewCount: "1.5k",
  },
  {
    id: "5",
    slug: "/products",
    name: "Urban Running Sneakers",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=330&fit=crop",
    saleTitle: "New Arrival",
    price: "$110",
    originalPrice: "",
    reviewCount: "900",
  },
]

export function SandboxFeaturedSlider({
  items = DEFAULT_ITEMS,
  slidesPerView = 3,
  spaceBetween = 30,
  autoplayDelay = 3000,
}: SandboxFeaturedSliderProps) {
  const plugin = React.useRef(
    Autoplay({
      delay: autoplayDelay,
      stopOnInteraction: true,
      stopOnMouseEnter: true,
    })
  )

  return (
    <section className="border-t bg-background py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between sm:mb-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Featured now
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
          >
            See All
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>

        <Carousel
          plugins={[plugin.current]}
          opts={{
            align: "start",
            loop: items.length > 1,
          }}
          className="w-full"
        >
          <CarouselContent>
            {items.map((item, index) => (
              <CarouselItem
                key={item.id}
                className="pl-4 md:basis-1/2 lg:basis-1/3"
                style={{
                  paddingRight: `${spaceBetween / 2}px`,
                  paddingLeft: `${spaceBetween / 2}px`,
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  viewport={{ once: true, margin: "-40px" }}
                >
                  <Link
                    href={item.slug}
                    className="shop-card-style4 group flex cursor-pointer items-center rounded-[15px] border border-border/60 bg-background p-4 shadow-[5px_15px_30px_0px_rgba(82,48,0,0.13)] transition-all duration-300 hover:border-border hover:shadow-lg sm:p-[15px_17px]"
                  >
                    <div className="dz-media mr-4 h-[165px] w-[150px] min-w-[150px] overflow-hidden rounded-[15px] transition-all duration-500 group-hover:[&_img]:scale-110 sm:h-[140px] sm:w-[120px] sm:min-w-[120px]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={150}
                        height={165}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="dz-content flex flex-col bg-transparent p-0 text-start">
                      <div className="mb-auto">
                        <h6 className="title mb-1 w-full text-[20px] font-medium capitalize leading-tight text-foreground lg:text-base">
                          {item.name}
                        </h6>
                        {item.saleTitle && (
                          <span
                            className="sale-title mb-1 block text-sm font-medium"
                            style={{ color: "#C49569" }}
                          >
                            {item.saleTitle}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex items-center">
                        {item.price && (
                          <h6 className="price mr-3 text-xl font-semibold text-foreground">
                            {item.price}
                            {item.originalPrice && (
                              <del className="ml-1 text-sm font-normal text-foreground/50">
                                {item.originalPrice}
                              </del>
                            )}
                          </h6>
                        )}
                        {item.reviewCount && (
                          <span className="review flex items-center text-sm font-normal text-foreground/50">
                            <svg
                              className="mr-1 inline-block size-3.5 text-[#FFA048]"
                              viewBox="0 0 16 16"
                              fill="#FFA048"
                            >
                              <path d="M8 .25a.75.75 0 01.673.74l1.837 3.718 4.107.597a.75.75 0 01.416 1.29l-2.972 2.893.701 4.084a.75.75 0 01-1.09.791L8 11.546l-3.704 1.948a.75.75 0 01-1.09-.79l.7-4.085-2.972-2.893a.75.75 0 01.417-1.29l4.107-.597 1.837-3.72A.75.75 0 018 .25z" />
                            </svg>
                            ({item.reviewCount})
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 sm:-left-12" />
          <CarouselNext className="right-2 sm:-right-12" />
        </Carousel>
      </div>
    </section>
  )
}
