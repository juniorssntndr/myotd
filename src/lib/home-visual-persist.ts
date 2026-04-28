import {
  type HomeVisualSettings,
  defaultHomeVisual,
  sanitizeHomeVisual,
} from "@/lib/home-visual"

export async function fetchHomeVisualFromApi(): Promise<HomeVisualSettings> {
  const response = await fetch("/api/admin/home-visual", { cache: "no-store" })
  if (!response.ok) {
    throw new Error("No se pudo cargar la configuración")
  }

  const data = await response.json()
  return sanitizeHomeVisual(data.homeVisual ?? defaultHomeVisual)
}

export async function persistHomeVisualToApi(homeVisualPatch: Partial<HomeVisualSettings>) {
  const response = await fetch("/api/admin/home-visual", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ homeVisual: homeVisualPatch }),
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string; details?: string } | null
    throw new Error(payload?.details || payload?.error || "No se pudo guardar")
  }

  const data = (await response.json()) as { homeVisual?: unknown }
  return sanitizeHomeVisual(data.homeVisual ?? defaultHomeVisual)
}
