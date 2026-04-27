import { HeroBanner } from "@/components/home/HeroBanner"
import { CategoryGrid } from "@/components/home/CategoryGrid"
import { FeaturedProducts } from "@/components/home/FeaturedProducts"
import { HomeBrandSection } from "@/components/home/HomeBrandSection"
import { HomeFeaturedOffersSection } from "@/components/home/HomeFeaturedOffersSection"

export function HomeContent() {
  return (
    <>
      <HeroBanner />
      <HomeBrandSection />
      <HomeFeaturedOffersSection />
      <CategoryGrid />
      <FeaturedProducts />
    </>
  )
}
