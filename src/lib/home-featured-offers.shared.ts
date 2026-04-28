export type HomeFeaturedOfferCard = {
  id: string
  title: string
  subtitle: string
  discount: string
  href: string
  image: string
  toneKey: OfferToneKey
}

export const OFFER_TONE_KEYS = ["tone0", "tone1", "tone2", "tone3", "tone4"] as const
export type OfferToneKey = (typeof OFFER_TONE_KEYS)[number]

export const OFFER_TONE_PRESETS = [
  {
    key: "tone0",
    label: "Ámbar / piedra",
    className: "from-orange-500/85 via-amber-500/50 to-stone-900/90",
  },
  {
    key: "tone1",
    label: "Slate / neutral",
    className: "from-slate-500/75 via-slate-700/45 to-neutral-950/92",
  },
  {
    key: "tone2",
    label: "Esmeralda / teal",
    className: "from-emerald-500/80 via-teal-500/45 to-slate-950/92",
  },
  {
    key: "tone3",
    label: "Índigo / violeta",
    className: "from-violet-500/80 via-indigo-500/50 to-slate-950/92",
  },
  {
    key: "tone4",
    label: "Rose / rojo",
    className: "from-rose-500/82 via-red-500/48 to-zinc-950/92",
  },
] as const

export const OFFER_TONE_CLASSES = OFFER_TONE_PRESETS.map((preset) => preset.className)

export const OFFER_TONE_LABELS: Record<OfferToneKey, string> = {
  tone0: "Ámbar / piedra",
  tone1: "Slate / neutral",
  tone2: "Esmeralda / teal",
  tone3: "Índigo / violeta",
  tone4: "Rose / rojo",
}

export function offerToneClassForKey(key: OfferToneKey): string {
  return OFFER_TONE_PRESETS.find((preset) => preset.key === key)?.className ?? OFFER_TONE_PRESETS[0].className
}
