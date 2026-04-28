import Link from "next/link"
import { ChevronRight } from "lucide-react"

import { HomeFeaturedOffersCarousel } from "@/components/home/HomeFeaturedOffersCarousel"
import { type HomeFeaturedOfferCard } from "@/lib/home-featured-offers.shared"
import {
  getHomeFeaturedOfferCards,
} from "@/lib/home-featured-offers"
import { type HomeFeaturedOffersVisual, defaultHomeVisual } from "@/lib/home-visual"
import { sanitizeImageUrl } from "@/lib/image-url"

export type { HomeFeaturedOfferCard }

function applyFeaturedOverrides(
  offers: HomeFeaturedOfferCard[],
  visual: HomeFeaturedOffersVisual
): HomeFeaturedOfferCard[] {
  return offers.map((offer) => {
    const override = visual.categoryOverrides[offer.id]
    if (!override) {
      return offer
    }

    const imageUrl = override.imageUrl?.trim()
    const image = imageUrl ? sanitizeImageUrl(imageUrl) : offer.image

    return {
      ...offer,
      image,
      toneKey: override.toneKey ?? offer.toneKey,
    }
  })
}

type HomeFeaturedOffersSectionProps = {
  visual?: HomeFeaturedOffersVisual
}

export async function HomeFeaturedOffersSection({
  visual = defaultHomeVisual.featuredOffers,
}: HomeFeaturedOffersSectionProps) {
  const offers = await getHomeFeaturedOfferCards()

  if (offers.length === 0) {
    return null
  }

  const offersWithOverrides = applyFeaturedOverrides(offers, visual)

  return (
    <section className="py-8 sm:py-10 lg:py-12">
      <div className="container mx-auto px-4">
        <div className="mb-6 flex items-center justify-between gap-3 sm:mb-7">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{visual.eyebrow}</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{visual.title}</h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-sm font-medium text-primary transition hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            {visual.ctaLabel}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <HomeFeaturedOffersCarousel offers={offersWithOverrides} visual={visual} />
      </div>
    </section>
  )
}
