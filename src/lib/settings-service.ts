import { unstable_noStore as noStore } from "next/cache"

import { prisma } from "@/lib/prisma"
import {
  type HomeVisualSettings,
  defaultHomeVisual,
  sanitizeHomeVisual,
} from "@/lib/home-visual"

export async function getHomeVisualSettings(): Promise<HomeVisualSettings> {
  try {
    noStore()

    const settings = await prisma.storeSettings.findUnique({
      where: { id: "singleton" },
      select: { homeVisual: true },
    })

    return sanitizeHomeVisual(settings?.homeVisual ?? defaultHomeVisual)
  } catch {
    return defaultHomeVisual
  }
}
