"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

interface SizeFilterProps {
  selectedSizes: string[]
  onSizesChange: (sizes: string[]) => void
  sizes: string[]
}

export function SizeFilter({ selectedSizes, onSizesChange, sizes }: SizeFilterProps) {
  const [isOpen, setIsOpen] = useState(true)

  const handleSizeToggle = (size: string) => {
    if (selectedSizes.includes(size)) {
      onSizesChange(selectedSizes.filter((s) => s !== size))
    } else {
      onSizesChange([...selectedSizes, size])
    }
  }

  return (
    <div className="border-b pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-2 font-medium"
      >
        Talla
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isOpen && (
        <div className="mt-3 flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => handleSizeToggle(size)}
              className={`min-w-[40px] rounded-full border px-3 py-1.5 text-sm transition-colors ${
                selectedSizes.includes(size)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-muted-foreground/30 hover:border-muted-foreground"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}