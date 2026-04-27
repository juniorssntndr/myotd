"use client"

import { useState } from "react"
import { Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface InlineCreateDialogProps {
  title: string
  isOpen: boolean
  onClose: () => void
  onSave: (name: string) => Promise<void>
}

export function InlineCreateDialog({ title, isOpen, onClose, onSave }: InlineCreateDialogProps) {
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) return

    setLoading(true)
    try {
      await onSave(name.trim())
    } finally {
      setLoading(false)
      setName("")
      onClose()
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setName("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="inline-name">Nombre</Label>
            <Input
              id="inline-name"
              placeholder="Ej: Nike, Polo, etc."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  e.preventDefault()
                  handleSave()
                }
              }}
              autoFocus
              disabled={loading}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setName("")
                onClose()
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={!name.trim() || loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface InlineCreateButtonProps {
  onClick: () => void
}

export function InlineCreateButton({ onClick }: InlineCreateButtonProps) {
  return (
    <Button type="button" variant="outline" size="icon" onClick={onClick}>
      <Plus className="h-4 w-4" />
    </Button>
  )
}