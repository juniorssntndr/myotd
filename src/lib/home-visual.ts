import { z } from "zod"

const HERO_GRADIENT_KEYS = ["warm-sunset", "pink-night", "rose-shadow"] as const
const HERO_TINT_KEYS = ["warm-glow", "fuchsia-pop", "violet-haze"] as const

export const HERO_GRADIENT_OPTIONS = [
  {
    value: "warm-sunset",
    label: "Rojo / Rose / Slate",
    className: "from-red-900 via-rose-900 to-slate-900",
    accentClass: "text-rose-300",
  },
  {
    value: "pink-night",
    label: "Rose / Pink / Slate",
    className: "from-rose-900 via-pink-900 to-slate-900",
    accentClass: "text-fuchsia-300",
  },
  {
    value: "rose-shadow",
    label: "Rose / Slate",
    className: "from-rose-800 via-slate-900 to-slate-900",
    accentClass: "text-violet-300",
  },
] as const

export const HERO_TINT_OPTIONS = [
  {
    value: "warm-glow",
    label: "Cálido",
    className: "from-red-500/70 via-rose-500/60 to-orange-400/50",
    glowClass: "from-orange-400/30 via-rose-500/20 to-transparent",
  },
  {
    value: "fuchsia-pop",
    label: "Fucsia / Pink",
    className: "from-fuchsia-500/70 via-pink-500/65 to-rose-500/55",
    glowClass: "from-fuchsia-400/30 via-pink-500/20 to-transparent",
  },
  {
    value: "violet-haze",
    label: "Rose / Violeta",
    className: "from-rose-400/60 via-violet-500/55 to-slate-500/60",
    glowClass: "from-violet-400/30 via-rose-400/20 to-transparent",
  },
] as const

type HeroGradientKey = (typeof HERO_GRADIENT_KEYS)[number]
type HeroTintKey = (typeof HERO_TINT_KEYS)[number]

const HERO_GRADIENT_CLASS_MAP: Record<HeroGradientKey, string> = {
  "warm-sunset": "from-red-900 via-rose-900 to-slate-900",
  "pink-night": "from-rose-900 via-pink-900 to-slate-900",
  "rose-shadow": "from-rose-800 via-slate-900 to-slate-900",
}

const HERO_GRADIENT_ACCENT_MAP: Record<HeroGradientKey, string> = {
  "warm-sunset": "text-rose-300",
  "pink-night": "text-fuchsia-300",
  "rose-shadow": "text-violet-300",
}

const HERO_TINT_CLASS_MAP: Record<HeroTintKey, string> = {
  "warm-glow": "from-red-500/70 via-rose-500/60 to-orange-400/50",
  "fuchsia-pop": "from-fuchsia-500/70 via-pink-500/65 to-rose-500/55",
  "violet-haze": "from-rose-400/60 via-violet-500/55 to-slate-500/60",
}

const HERO_TINT_GLOW_MAP: Record<HeroTintKey, string> = {
  "warm-glow": "from-orange-400/30 via-rose-500/20 to-transparent",
  "fuchsia-pop": "from-fuchsia-400/30 via-pink-500/20 to-transparent",
  "violet-haze": "from-violet-400/30 via-rose-400/20 to-transparent",
}

const LEGACY_HERO_GRADIENT_MAP: Record<string, HeroGradientKey> = {
  "from-red-900 via-rose-900 to-slate-900": "warm-sunset",
  "from-rose-900 via-pink-900 to-slate-900": "pink-night",
  "from-rose-800 via-slate-900 to-slate-900": "rose-shadow",
}

const LEGACY_HERO_TINT_MAP: Record<string, HeroTintKey> = {
  "from-red-500/70 via-rose-500/60 to-orange-400/50": "warm-glow",
  "from-fuchsia-500/70 via-pink-500/65 to-rose-500/55": "fuchsia-pop",
  "from-rose-400/60 via-violet-500/55 to-slate-500/60": "violet-haze",
}

const gradientPresetSchema = z.enum(HERO_GRADIENT_KEYS)

const tintPresetSchema = z.enum(HERO_TINT_KEYS)

const clampPercentage = z.coerce.number().min(0).max(100)

export const homeVisualSlideSchema = z.object({
  id: z.number().int().min(1).max(3),
  badge: z.string().min(1).max(60),
  title: z.string().min(1).max(80),
  subtitle: z.string().min(1).max(80),
  description: z.string().min(1).max(220),
  cta: z.string().min(1).max(32),
  href: z.string().min(1).max(256),
  gradient: gradientPresetSchema,
  overlayTint: tintPresetSchema,
  image: z.string().min(1).max(512).refine(
    (val) => val.startsWith("/") || z.string().url().safeParse(val).success,
    { message: "Debe ser una URL válida o una ruta local que empiece con /" }
  ),
})

/** Para formularios admin (react-hook-form): números estrictos, sin coerce. */
export const homeHeroFormSchema = z.object({
  imageOpacity: z.number().min(0).max(100),
  tintOpacity: z.number().min(0).max(100),
  sideShadeOpacity: z.number().min(0).max(100),
  radialHighlightOpacity: z.number().min(0).max(100),
  radialShadowOpacity: z.number().min(0).max(100),
  slides: z.array(homeVisualSlideSchema).min(3).max(3),
})

export const homeHeroVisualSchema = z.object({
  imageOpacity: clampPercentage.default(60),
  tintOpacity: clampPercentage.default(100),
  sideShadeOpacity: clampPercentage.default(18),
  radialHighlightOpacity: clampPercentage.default(3),
  radialShadowOpacity: clampPercentage.default(6),
  slides: z.array(homeVisualSlideSchema).min(3).max(3),
})

const brandOverrideEntrySchema = z.object({
  displayName: z.string().max(80).optional(),
  heroImage: z
    .string()
    .max(512)
    .refine((val) => !val || val.startsWith("/") || z.string().url().safeParse(val).success, {
      message: "Debe ser una URL válida o una ruta local que empiece con /",
    })
    .optional(),
  logoUrl: z
    .string()
    .max(512)
    .refine((val) => !val || val.startsWith("/") || z.string().url().safeParse(val).success, {
      message: "Debe ser una URL válida o una ruta local que empiece con /",
    })
    .optional(),
})

export const homeBrandsVisualSchema = z.object({
  title: z.string().min(1).max(80),
  subtitle: z.string().min(1).max(180),
  imageOverlayOpacity: clampPercentage.default(45),
  showStoreBadge: z.boolean().default(true),
  brandOverrides: z.record(z.string(), brandOverrideEntrySchema).default({}),
})

const offerToneKeySchema = z.enum(["tone0", "tone1", "tone2", "tone3", "tone4"])

const categoryOfferOverrideSchema = z.object({
  imageUrl: z
    .string()
    .max(512)
    .refine((val) => !val || val.startsWith("/") || z.string().url().safeParse(val).success, {
      message: "Debe ser una URL válida o una ruta local que empiece con /",
    })
    .optional(),
  toneKey: offerToneKeySchema.optional(),
})

export const homeFeaturedOffersVisualSchema = z.object({
  eyebrow: z.string().min(1).max(80),
  title: z.string().min(1).max(80),
  ctaLabel: z.string().min(1).max(32),
  toneOpacity: clampPercentage.default(55),
  darkFromOpacity: clampPercentage.default(92),
  darkViaOpacity: clampPercentage.default(50),
  darkToOpacity: clampPercentage.default(15),
  radialDarkOpacity: clampPercentage.default(62),
  categoryOverrides: z.record(z.string(), categoryOfferOverrideSchema).default({}),
})

export const homeVisualSchema = z.object({
  hero: homeHeroVisualSchema,
  brands: homeBrandsVisualSchema,
  featuredOffers: homeFeaturedOffersVisualSchema,
})

export type HomeVisualSettings = z.infer<typeof homeVisualSchema>
export type HomeHeroVisual = HomeVisualSettings["hero"]
export type HomeBrandsVisual = HomeVisualSettings["brands"]
export type HomeFeaturedOffersVisual = HomeVisualSettings["featuredOffers"]
export type HomeBrandOverrideEntry = z.infer<typeof brandOverrideEntrySchema>
export type HomeCategoryOfferOverride = z.infer<typeof categoryOfferOverrideSchema>
export type HomeOfferToneKey = z.infer<typeof offerToneKeySchema>

export function resolveHeroGradientClass(key: HeroGradientKey) {
  return HERO_GRADIENT_CLASS_MAP[key] ?? HERO_GRADIENT_CLASS_MAP["warm-sunset"]
}

export function resolveHeroAccentClass(key: HeroGradientKey) {
  return HERO_GRADIENT_ACCENT_MAP[key] ?? HERO_GRADIENT_ACCENT_MAP["warm-sunset"]
}

export function resolveHeroTintClass(key: HeroTintKey) {
  return HERO_TINT_CLASS_MAP[key] ?? HERO_TINT_CLASS_MAP["warm-glow"]
}

export function resolveHeroGlowClass(key: HeroTintKey) {
  return HERO_TINT_GLOW_MAP[key] ?? HERO_TINT_GLOW_MAP["warm-glow"]
}

export const defaultHomeVisual: HomeVisualSettings = {
  hero: {
    imageOpacity: 60,
    tintOpacity: 100,
    sideShadeOpacity: 18,
    radialHighlightOpacity: 3,
    radialShadowOpacity: 6,
    slides: [
      {
        id: 1,
        badge: "Nueva Colección",
        title: "Streetwear 2026",
        subtitle: "Tu Estilo, Tu Ciudad",
        description:
          "Nike, Adidas, Converse, Puma, New Balance y Zara en una selección urbana curada",
        cta: "Ver Catálogo",
        href: "/products",
        gradient: "warm-sunset",
        overlayTint: "warm-glow",
        image: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=800",
      },
      {
        id: 2,
        badge: "Hasta 40% OFF",
        title: "Zapatillas",
        subtitle: "Las Más Buscadas",
        description:
          "Nike, Adidas, Converse, New Balance y Puma. Envío a todo el Perú",
        cta: "Ver Ofertas",
        href: "/products?category=zapatillas",
        gradient: "pink-night",
        overlayTint: "fuchsia-pop",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
      },
      {
        id: 3,
        badge: "Bestseller",
        title: "Hoodies & Polos",
        subtitle: "Comodidad Total",
        description:
          "Prendas versátiles para tu día a día. Calidad premium",
        cta: "Explorar",
        href: "/products?category=hoodies",
        gradient: "rose-shadow",
        overlayTint: "violet-haze",
        image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800",
      },
    ],
  },
  brands: {
    title: "Las mejores marcas para ti",
    subtitle: "Nike, Adidas, Converse, Puma y más en un solo lugar",
    imageOverlayOpacity: 45,
    showStoreBadge: true,
    brandOverrides: {},
  },
  featuredOffers: {
    eyebrow: "Featured Offer For You",
    title: "Ofertas destacadas",
    ctaLabel: "See All",
    toneOpacity: 55,
    darkFromOpacity: 92,
    darkViaOpacity: 50,
    darkToOpacity: 15,
    radialDarkOpacity: 62,
    categoryOverrides: {},
  },
}

function withIdFallback(
  slides: HomeVisualSettings["hero"]["slides"]
): HomeVisualSettings["hero"]["slides"] {
  return slides.slice(0, 3).map((slide, index) => ({
    ...slide,
    id: index + 1,
  }))
}

function normalizeLegacySlidePresets(input: unknown) {
  if (!input || typeof input !== "object") {
    return input
  }

  const slide = input as Record<string, unknown>

  return {
    ...slide,
    gradient:
      typeof slide.gradient === "string"
        ? (LEGACY_HERO_GRADIENT_MAP[slide.gradient] ?? slide.gradient)
        : slide.gradient,
    overlayTint:
      typeof slide.overlayTint === "string"
        ? (LEGACY_HERO_TINT_MAP[slide.overlayTint] ?? slide.overlayTint)
        : slide.overlayTint,
  }
}

function normalizeLegacyHomeVisualInput(input: unknown) {
  if (!input || typeof input !== "object") {
    return input
  }

  const root = input as Record<string, unknown>
  const hero = root.hero

  if (!hero || typeof hero !== "object") {
    return input
  }

  const heroRecord = hero as Record<string, unknown>

  return {
    ...root,
    hero: {
      ...heroRecord,
      slides: Array.isArray(heroRecord.slides)
        ? heroRecord.slides.map(normalizeLegacySlidePresets)
        : heroRecord.slides,
    },
  }
}

export function sanitizeHomeVisual(input: unknown): HomeVisualSettings {
  const parsed = homeVisualSchema.safeParse(normalizeLegacyHomeVisualInput(input))
  if (!parsed.success) {
    return defaultHomeVisual
  }

  return {
    ...parsed.data,
    hero: {
      ...parsed.data.hero,
      slides: withIdFallback(parsed.data.hero.slides),
    },
    brands: {
      ...parsed.data.brands,
      brandOverrides: parsed.data.brands.brandOverrides ?? {},
    },
    featuredOffers: {
      ...parsed.data.featuredOffers,
      categoryOverrides: parsed.data.featuredOffers.categoryOverrides ?? {},
    },
  }
}

export function mergeHomeVisual(
  base: HomeVisualSettings,
  patch: Partial<HomeVisualSettings>
): HomeVisualSettings {
  return sanitizeHomeVisual({
    ...base,
    ...patch,
    hero: patch.hero ? { ...base.hero, ...patch.hero, slides: patch.hero.slides ?? base.hero.slides } : base.hero,
    brands: patch.brands
      ? {
          ...base.brands,
          ...patch.brands,
          brandOverrides: {
            ...base.brands.brandOverrides,
            ...patch.brands.brandOverrides,
          },
        }
      : base.brands,
    featuredOffers: patch.featuredOffers
      ? {
          ...base.featuredOffers,
          ...patch.featuredOffers,
          categoryOverrides: {
            ...base.featuredOffers.categoryOverrides,
            ...patch.featuredOffers.categoryOverrides,
          },
        }
      : base.featuredOffers,
  })
}
