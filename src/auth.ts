/* eslint-disable @typescript-eslint/no-unused-vars */
// src/auth.ts
import NextAuth, { type DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { JWT } from "next-auth/jwt"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { authConfig } from "./auth.config"

type RoleType = "ADMIN" | "GCM" | "COMANDO" | "LIDER" | "SUPERVISOR"

declare module "next-auth" {
  interface User {
    role?: RoleType
    matricula?: string
  }
  interface Session {
    user: {
      role?: RoleType
      matricula?: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    role?: RoleType
    matricula?: string
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "Matrícula e Senha",
      credentials: {
        matricula: { label: "Matrícula", type: "text" },
        senha: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.matricula || !credentials?.senha) {
          throw new Error("Credenciais inválidas")
        }

        const usuario = await prisma.usuario.findUnique({
          where: { matricula: credentials.matricula as string }
        })

        if (!usuario) {
          throw new Error("Usuário não encontrado")
        }

        const senhaValida = await bcrypt.compare(
          credentials.senha as string,
          usuario.senha
        )

        if (!senhaValida) {
          throw new Error("Senha incorreta")
        }

        return {
          id: usuario.id,
          name: usuario.nome,
          matricula: usuario.matricula,
          role: usuario.role,
        }
      }
    })
  ],
})