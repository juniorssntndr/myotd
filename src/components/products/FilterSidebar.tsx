"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BrandFilter } from "./BrandFilter"
import { PriceFilter } from "./PriceFilter"
import { CategoryFilter } from "./CategoryFilter"
import { SizeFilter } from "./SizeFilter"
import { ColorFilter } from "./ColorFilter"
import { FilterState } from "@/types"

interface FilterSidebarProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
}

const ALL_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "40", "41", "42", "43", "44", "45", "36", "37", "38", "39"]

const ALL_COLORS = [
  { name: "Negro", hex: "#000000" },
  { name: "Blanco", hex: "#FFFFFF" },
  { name: "Gris", hex: "#808080" },
  { name: "Navy", hex: "#000080" },
  { name: "Rojo", hex: "#DC2626" },
  { name: "Verde", hex: "#22C55E" },
  { name: "Beige", hex: "#D4C4B0" },
]

export function FilterSidebar({ filters, onFiltersChange }: FilterSidebarProps) {
  const hasActiveFilters =
    filters.brands.length > 0 ||
    filters.categories.length > 0 ||
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 5000

  const handleClearFilters = () => {
    onFiltersChange({
      brands: [],
      categories: [],
      sizes: [],
      colors: [],
      priceRange: [0, 5000],
      sortBy: filters.sortBy,
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Filtros</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="h-auto p-0 text-sm text-primary hover:text-primary/80"
          >
            Limpiar
            <X className="ml-1 h-3 w-3" />
          </Button>
        )}
      </div>

      <BrandFilter
        selectedBrands={filters.brands}
        onBrandsChange={(brands) =>
          onFiltersChange({ ...filters, brands })
        }
      />

      <PriceFilter
        priceRange={filters.priceRange}
        onPriceChange={(priceRange) =>
          onFiltersChange({ ...filters, priceRange })
        }
      />

      <CategoryFilter
        selectedCategories={filters.categories}
        onCategoriesChange={(categories) =>
          onFiltersChange({ ...filters, categories })
        }
      />

      <SizeFilter
        selectedSizes={filters.sizes}
        onSizesChange={(sizes) =>
          onFiltersChange({ ...filters, sizes })
        }
        sizes={ALL_SIZES}
      />

      <ColorFilter
        selectedColors={filters.colors}
        onColorsChange={(colors) =>
          onFiltersChange({ ...filters, colors })
        }
        colors={ALL_COLORS}
      />
    </div>
  )
}