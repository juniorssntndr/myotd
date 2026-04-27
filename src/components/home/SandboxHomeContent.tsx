import { HeroBanner } from "@/components/home/HeroBanner"
import { CategoryGrid } from "@/components/home/CategoryGrid"
import { FeaturedProducts } from "@/components/home/FeaturedProducts"
import { SandboxBrandSection } from "@/components/home/SandboxBrandSection"
import { SandboxFeaturedOffersSection } from "@/components/home/SandboxFeaturedOffersSection"

export function SandboxHomeContent() {
  return (
    <>
      <HeroBanner />
      <SandboxBrandSection />
      <SandboxFeaturedOffersSection />
      <CategoryGrid />
      <FeaturedProducts />
    </>
  )
}
