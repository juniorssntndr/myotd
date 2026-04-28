import type { NextAuthConfig } from "next-auth"

/**
 * Auth config compartida que NO importa Prisma ni bcrypt.
 * Es Edge-compatible y puede ser usada en el middleware de Next.js.
 *
 * El provider de Credentials SIN `authorize` es necesario porque
 * NextAuth necesita conocer qué providers existen para manejar el JWT,
 * pero la lógica de autorización solo corre en Node.js (en auth.ts).
 */
export const authConfig: NextAuthConfig = {
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string
        token.role = user.role as string
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
}
