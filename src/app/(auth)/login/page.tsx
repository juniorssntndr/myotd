import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { LoginForm } from "@/components/auth/LoginForm"

export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center font-medium">
          <Image src="/myotd-logo.png" alt="Myotd" width={180} height={64} className="h-14 w-auto" priority />
        </Link>
        <div className="text-center">
          <h1 className="text-xl font-bold">Ingresa a tu cuenta</h1>
          <p className="mt-1 text-sm text-muted-foreground">Tu estilo, tu ciudad</p>
        </div>
        <Suspense fallback={<div className="text-center">Cargando...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}
