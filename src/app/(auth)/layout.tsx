import Image from "next/image"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh">
      <div className="relative hidden w-1/2 flex-col justify-end overflow-hidden bg-gradient-to-br from-red-900 via-rose-900 to-slate-900 p-10 text-white lg:flex">
        <div className="absolute inset-0 opacity-20">
          <Image
            src="https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=1920"
            alt="Background"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative z-10 pb-8">
          <h1 className="text-4xl font-bold tracking-tight text-white">Tu Estilo, Tu Ciudad</h1>
          <p className="mt-4 max-w-md text-lg text-slate-300">
            Las mejores marcas de moda urbana en un solo lugar. Descubre tu próximo outfit.
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center lg:w-1/2">
        {children}
      </div>
    </div>
  )
}