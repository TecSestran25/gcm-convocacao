// src/auth.config.ts
import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    
    // 1. CONTROLE DE TRÁFEGO (Middleware)
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const role = auth?.user?.role as string | undefined

      const isOnAdmin = nextUrl.pathname.startsWith('/admin')
      const isOnGcm = nextUrl.pathname.startsWith('/gcm')

      // Se tentar acessar rota protegida sem login, bloqueia (manda pro signIn)
      if (!isLoggedIn && (isOnAdmin || isOnGcm)) {
        return false
      }

      if (isLoggedIn) {
        const isAdminOrComando = role === 'ADMIN' || role === 'COMANDO'

        // Se tentar acessar o admin e NÃO for Admin/Comando, redireciona para a visão GCM
        if (isOnAdmin && !isAdminOrComando) {
          return Response.redirect(new URL('/gcm/convocacoes', nextUrl))
        }

        // Se logar com sucesso, manda direto pro painel correto
        if (nextUrl.pathname === '/login' || nextUrl.pathname === '/') {
          if (isAdminOrComando) {
            return Response.redirect(new URL('/admin/dashboard', nextUrl))
          } else {
            return Response.redirect(new URL('/gcm/convocacoes', nextUrl))
          }
        }
      }

      return true
    },

    // 2. ENRIQUECER O TOKEN COM DADOS DO BANCO
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.matricula = user.matricula
      }
      return token
    },

    // 3. PASSAR O TOKEN PARA A SESSÃO DO USUÁRIO
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        // Tipagem atualizada para aceitar todos os novos cargos
        session.user.role = token.role as "ADMIN" | "GCM" | "COMANDO" | "LIDER" | "SUPERVISOR"
        session.user.matricula = token.matricula as string
      }
      return session
    }
  },
  providers: [], 
} satisfies NextAuthConfig