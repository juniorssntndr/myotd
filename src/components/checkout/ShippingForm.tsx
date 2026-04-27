"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SHIPPING_ZONES } from "@/lib/shipping"
import { ShippingAddress } from "@/types"

interface ShippingFormProps {
  value: ShippingAddress
  onChange: (data: ShippingAddress) => void
}

const LIMA_DISTRICTS = SHIPPING_ZONES.find((z) => z.id === "lima-centro")?.districts || []
const LIMA_SUR_DISTRICTS = SHIPPING_ZONES.find((z) => z.id === "lima-sur")?.districts || []
const LIMA_NORTE_DISTRICTS = SHIPPING_ZONES.find((z) => z.id === "lima-norte")?.districts || []
const LIMA_ESTE_DISTRICTS = SHIPPING_ZONES.find((z) => z.id === "lima-este")?.districts || []
const CALLAO_DISTRICTS = SHIPPING_ZONES.find((z) => z.id === "callao")?.districts || []

export function ShippingForm({ value, onChange }: ShippingFormProps) {
  const handleCityChange = (city: string) => {
    onChange({
      ...value,
      city,
      district: city === "Provincia" ? "Provincia" : "",
    })
  }

  const handleDistrictChange = (district: string) => {
    onChange({ ...value, district })
  }

  const handleChange = (field: keyof ShippingAddress, next: string) => {
    onChange({ ...value, [field]: next })
  }

  const getDistricts = () => {
    switch (value.city) {
      case "Lima Centro":
        return LIMA_DISTRICTS
      case "Lima Sur":
        return LIMA_SUR_DISTRICTS
      case "Lima Norte":
        return LIMA_NORTE_DISTRICTS
      case "Lima Este":
        return LIMA_ESTE_DISTRICTS
      case "Callao":
        return CALLAO_DISTRICTS
      default:
        return []
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Información de Envío</h2>

      <div className="space-y-2">
        <Label htmlFor="name">Nombre Completo</Label>
        <Input
          id="name"
          placeholder="Juan Pérez"
          value={value.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+51 999 888 777"
          value={value.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Dirección</Label>
        <Input
          id="address"
          placeholder="Av. Principal 123, Dpto. 4"
          value={value.address}
          onChange={(e) => handleChange("address", e.target.value)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="city">Zona</Label>
          <Select value={value.city} onValueChange={handleCityChange}>
            <SelectTrigger id="city">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Lima Centro">Lima Centro</SelectItem>
              <SelectItem value="Lima Sur">Lima Sur</SelectItem>
              <SelectItem value="Lima Norte">Lima Norte</SelectItem>
              <SelectItem value="Lima Este">Lima Este</SelectItem>
              <SelectItem value="Callao">Callao</SelectItem>
              <SelectItem value="Provincia">Provincia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="district">Distrito</Label>
          {value.city === "Provincia" ? (
            <Input
              id="district"
              placeholder="Distrito o provincia"
              value={value.district}
              onChange={(e) => handleDistrictChange(e.target.value)}
            />
          ) : (
            <Select value={value.district} onValueChange={handleDistrictChange}>
              <SelectTrigger id="district">
                <SelectValue placeholder="Seleccionar" />
              </SelectTrigger>
              <SelectContent>
                {getDistricts().map((district) => (
                  <SelectItem key={district} value={district}>
                    {district}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="zipCode">Código Postal</Label>
        <Input
          id="zipCode"
          placeholder="15001"
          value={value.zipCode}
          onChange={(e) => handleChange("zipCode", e.target.value)}
        />
      </div>
    </div>
  )
}