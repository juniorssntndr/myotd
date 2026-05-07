"use client"

import { HexColorPicker } from "react-colorful"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState, useEffect, useRef } from "react"

interface ColorPickerCustomProps {
  color: string
  onChange: (color: string) => void
  label?: string
}

export function ColorPickerCustom({ color, onChange, label }: ColorPickerCustomProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentHex, setCurrentHex] = useState(color)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrentHex(color)
  }, [color])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value
    setCurrentHex(hex)
    if (/^#[0-9A-F]{6}$/i.test(hex)) {
      onChange(hex)
    }
  }

  return (
    <div className="flex flex-col gap-2 relative">
      {label && <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">{label}</span>}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            className="h-10 w-10 shrink-0 rounded-full border-2 p-0 shadow-inner hover:scale-105 transition-transform"
            style={{ backgroundColor: color }}
            onClick={() => setIsOpen(!isOpen)}
          />
          {isOpen && (
            <div 
              ref={popoverRef}
              className="absolute left-0 top-12 z-50 rounded-2xl border bg-card p-4 shadow-2xl animate-in fade-in zoom-in duration-200"
            >
              <HexColorPicker color={color} onChange={onChange} />
            </div>
          )}
        </div>
        <Input
          value={currentHex}
          onChange={handleHexChange}
          className="h-10 font-mono text-sm uppercase tracking-tight focus-visible:ring-primary/30"
          placeholder="#FFFFFF"
        />
      </div>
    </div>
  )
}
