"use client"

import { useEffect } from "react"
import { Truck, Award, ShieldCheck } from "lucide-react"
import { useSettingsStore } from "@/stores/settings-store"

export function TopBar() {
  const freeShippingThreshold = useSettingsStore(
    (state) => state.storeConfig.freeShippingThreshold
  )
  const fetchSettings = useSettingsStore((state) => state.fetchSettings)

  useEffect(() => {
    void fetchSettings(true)
  }, [fetchSettings])

  return (
    <div className="bg-[#E11D48] text-white">
      <div className="container mx-auto px-4">
        <div className="flex h-9 items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-[10px] sm:text-xs truncate">
            <span className="sm:hidden font-medium">Envío gratis desde S/ {freeShippingThreshold}</span>
            <span className="hidden sm:inline">
              Envío gratis en pedidos desde <span className="font-semibold">S/ {freeShippingThreshold}</span> • hasta 40% OFF
            </span>
          </div>
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-1.5">
              <Truck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Envío a Todo el Perú</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Las Mejores Marcas</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Compra Segura</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
