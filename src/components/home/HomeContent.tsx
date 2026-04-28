import { HeroBanner } from "@/components/home/HeroBanner"
import { CategoryGrid } from "@/components/home/CategoryGrid"
import { FeaturedProducts } from "@/components/home/FeaturedProducts"
import { HomeBrandSection } from "@/components/home/HomeBrandSection"
import { HomeFeaturedOffersSection } from "@/components/home/HomeFeaturedOffersSection"
import { getHomeVisualSettings } from "@/lib/settings-service"

export async function HomeContent() {
  const homeVisual = await getHomeVisualSettings()

  return (
    <>
      <HeroBanner visual={homeVisual.hero} />
      <HomeBrandSection visual={homeVisual.brands} />
      <HomeFeaturedOffersSection visual={homeVisual.featuredOffers} />
      <CategoryGrid />
      <FeaturedProducts />
    </>
  )
}
