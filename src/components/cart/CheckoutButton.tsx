"use client"

import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { CreditCard, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { CartItem } from "@/types"

interface CheckoutButtonProps {
  items: CartItem[]
}

export function CheckoutButton({ items }: CheckoutButtonProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleClick = () => {
    if (!session) {
      router.push("/login?callbackUrl=/checkout")
      return
    }

    router.push("/checkout")
  }

  return (
    <Button
      onClick={handleClick}
      disabled={status === "loading" || items.length === 0}
      className="w-full"
      size="lg"
    >
      {!session ? (
        <>
          <LogIn className="mr-2 h-4 w-4" />
          Iniciar sesión para continuar
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          Ir a checkout
        </>
      )}
    </Button>
  )
}
