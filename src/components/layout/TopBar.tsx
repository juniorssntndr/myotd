import { Truck, Award, ShieldCheck } from "lucide-react"

export function TopBar() {
  return (
    <div className="bg-[#E11D48] text-white">
      <div className="container mx-auto px-4">
        <div className="flex h-9 items-center justify-between text-xs">
          <div className="flex items-center gap-1">
            <span className="hidden sm:inline">Envío gratis en pedidos desde</span>
            <span className="font-semibold">S/ 200</span>
            <span className="hidden sm:inline">• hasta 40% OFF</span>
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
