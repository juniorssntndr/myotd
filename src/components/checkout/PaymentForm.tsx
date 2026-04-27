"use client"

import { CreditCard, Building2, Smartphone, Banknote } from "lucide-react"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { PaymentMethod } from "@/types"

interface PaymentFormProps {
  value?: PaymentMethod
  onChange?: (method: PaymentMethod) => void
  shippingCost?: number
  total?: number
  cashOnDeliveryAvailable?: boolean
}

const bankAccounts = {
  BCP: {
    account: "191-1234567890-1-55",
    CCI: "002191123456789055"
  },
  BBVA: {
    account: "0011-0234-5678901234-56",
    CCI: "01123456789012345678"
  },
  Interbank: {
    account: "123-4567890123-4",
    CCI: "00312345678901234567"
  },
  Scotiabank: {
    account: "000-456789",
    CCI: "009456789"
  }
}

export function PaymentForm({
  value = "CARD",
  onChange,
  shippingCost = 0,
  total = 0,
  cashOnDeliveryAvailable = true,
}: PaymentFormProps) {
  const handleChange = (method: string) => {
    onChange?.(method as PaymentMethod)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Método de Pago</h2>

      <RadioGroup value={value} onValueChange={handleChange} className="space-y-3">
        <div>
          <RadioGroupItem value="CARD" id="card" className="peer sr-only" />
          <Label
            htmlFor="card"
            className="flex cursor-pointer items-start gap-4 rounded-lg border p-4 peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary"
          >
            <CreditCard className="h-5 w-5 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Tarjeta de Crédito/Débito</p>
              <p className="text-sm text-muted-foreground">
                Visa, Mastercard, American Express
              </p>
            </div>
          </Label>
        </div>

        <div>
          <RadioGroupItem value="WALLET" id="wallet" className="peer sr-only" />
          <Label
            htmlFor="wallet"
            className="flex cursor-pointer items-start gap-4 rounded-lg border p-4 peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary"
          >
            <Smartphone className="h-5 w-5 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Yape o Plin</p>
              <p className="text-sm text-muted-foreground">
                Paga con tu billetera digital favorita
              </p>
            </div>
          </Label>
        </div>

        <div>
          <RadioGroupItem value="TRANSFER" id="transfer" className="peer sr-only" />
          <Label
            htmlFor="transfer"
            className="flex cursor-pointer items-start gap-4 rounded-lg border p-4 peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary"
          >
            <Building2 className="h-5 w-5 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Transferencia Bancaria</p>
              <p className="text-sm text-muted-foreground">
                BCP, BBVA, Interbank, Scotiabank
              </p>
            </div>
          </Label>
        </div>

        {value === "TRANSFER" && (
          <Card className="ml-8 mt-2">
            <CardContent className="p-4 space-y-4">
              <p className="text-sm font-medium">Datos para transferencia:</p>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Banco:</span>
                  <span className="font-medium">BCP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">N° Cuenta:</span>
                  <span className="font-mono">{bankAccounts.BCP.account}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CCI:</span>
                  <span className="font-mono text-xs">{bankAccounts.BCP.CCI}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Titular:</span>
                  <span>MYOTD S.A.C.</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Usa el número de pedido como concepto de pago
              </p>
            </CardContent>
          </Card>
        )}

        <div>
          <RadioGroupItem value="CASH_ON_DELIVERY" id="cod" className="peer sr-only" disabled={!cashOnDeliveryAvailable} />
          <Label
            htmlFor="cod"
            className={`flex items-start gap-4 rounded-lg border p-4 peer-data-[state=checked]:border-primary peer-data-[state=checked]:ring-1 peer-data-[state=checked]:ring-primary ${cashOnDeliveryAvailable ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
          >
            <Banknote className="h-5 w-5 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">Pago contra Entrega</p>
              <p className="text-sm text-muted-foreground">
                {cashOnDeliveryAvailable
                  ? "Solo disponible en Lima (efectivo o Yape/Plin al recibir)"
                  : "No disponible para la zona seleccionada"}
              </p>
            </div>
          </Label>
        </div>
      </RadioGroup>

      {(shippingCost > 0 || total > 0) && (
        <div className="rounded-lg border bg-muted/50 p-4 mt-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Costo de envío:</span>
            <span className={shippingCost === 0 ? "text-green-600 font-medium" : ""}>
              {shippingCost === 0 ? "Gratis" : `S/ ${shippingCost.toFixed(2)}`}
            </span>
          </div>
          <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
            <span>Total a pagar:</span>
            <span className="text-primary">S/ {total.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
