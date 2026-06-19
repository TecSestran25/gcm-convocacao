// src/auth.config.ts
import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.matricula = user.matricula
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as "ADMIN" | "GCM"
        session.user.matricula = token.matricula as string
      }
      return session
    }
  },
  providers: [], 
} satisfies NextAuthConfig