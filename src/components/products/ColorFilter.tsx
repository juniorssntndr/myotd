"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

interface ColorOption {
  name: string
  hex: string
}

interface ColorFilterProps {
  selectedColors: string[]
  onColorsChange: (colors: string[]) => void
  colors: ColorOption[]
}

export function ColorFilter({ selectedColors, onColorsChange, colors }: ColorFilterProps) {
  const [isOpen, setIsOpen] = useState(true)

  const handleColorToggle = (colorName: string) => {
    if (selectedColors.includes(colorName)) {
      onColorsChange(selectedColors.filter((c) => c !== colorName))
    } else {
      onColorsChange([...selectedColors, colorName])
    }
  }

  return (
    <div className="border-b pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-2 font-medium"
      >
        Color
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {isOpen && (
        <div className="mt-3 flex flex-wrap gap-3">
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() => handleColorToggle(color.name)}
              className={`relative h-8 w-8 rounded-full border-2 transition-all ${
                selectedColors.includes(color.name)
                  ? "border-primary ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : "border-transparent hover:border-muted-foreground/50"
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.name}
            >
              {selectedColors.includes(color.name) && (
                <span className="absolute inset-0 flex items-center justify-center">
                  {color.name === "Blanco" || color.name === "Beige" ? (
                    <svg className="h-4 w-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}