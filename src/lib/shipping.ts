// Shipping zones configuration for Peru
// Implementation by Subagente C (Checkout/Pagos/Operación)

export interface ShippingZone {
  id: string
  name: string
  districts: string[]
  baseCost: number
  estimatedDays: string
}

export const SHIPPING_ZONES: ShippingZone[] = [
  {
    id: "lima-centro",
    name: "Lima Centro",
    districts: [
      "Lima", "Rimac", "Breña", "La Victoria", "San Miguel",
      "Pueblo Libre", "Jesus Maria", "Lince", "San Isidro",
    ],
    baseCost: 10,
    estimatedDays: "1-2 días",
  },
  {
    id: "lima-sur",
    name: "Lima Sur",
    districts: [
      "Miraflores", "Barranco", "Santiago de Surco", "San Juan de Miraflores",
      "Villa El Salvador", "Villa Maria del Triunfo", "Chorrillos",
      "Pachacamac", "Lurin", "Punta Hermosa",
    ],
    baseCost: 12,
    estimatedDays: "1-3 días",
  },
  {
    id: "lima-norte",
    name: "Lima Norte",
    districts: [
      "Comas", "Los Olivos", "San Juan de Lurigancho", "Carabayllo",
      "Puente Piedra", "Independencia", "Ancash", "Los Reyes",
    ],
    baseCost: 12,
    estimatedDays: "1-3 días",
  },
  {
    id: "lima-este",
    name: "Lima Este",
    districts: [
      "Ate", "Santa Anita", "El Agustino", "San Luis",
      "La Molina", "Cieneguilla", "Chaclacayo",
    ],
    baseCost: 12,
    estimatedDays: "1-3 días",
  },
  {
    id: "callao",
    name: "Callao",
    districts: ["Callao", "Bellavista", "La Perla", "Carmen de la Legua", "Ventanilla"],
    baseCost: 14,
    estimatedDays: "1-2 días",
  },
  {
    id: "provincias",
    name: "Provincias",
    districts: [],
    baseCost: 20,
    estimatedDays: "3-7 días",
  },
]

export const FREE_SHIPPING_THRESHOLD = 200 // S/ 200

export function getShippingCost(district: string, subtotal: number): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0
  }

  const zone = SHIPPING_ZONES.find((z) =>
    z.districts.length === 0 || z.districts.includes(district)
  )

  return zone?.baseCost ?? 20
}

export function findZoneByDistrict(district: string): ShippingZone | undefined {
  return SHIPPING_ZONES.find((z) =>
    z.districts.length === 0 || z.districts.includes(district)
  )
}
