// src/app/admin/efetivo/actions.ts
"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function criarGCM(formData: FormData) {
  const nome = formData.get("nome") as string
  const matricula = formData.get("matricula") as string
  const equipe = formData.get("equipe") as string

  // Verifica se já existe alguém com essa matrícula para evitar crash no banco
  const existe = await prisma.usuario.findUnique({
    where: { matricula }
  })

  if (existe) {
    throw new Error("Matrícula já cadastrada no sistema.")
  }

  // Senha padrão inicial: gcm123 (o guarda poderá mudar depois)
  const senhaHash = await bcrypt.hash("gcm123", 10)

  // Salva no banco de dados
  await prisma.usuario.create({
    data: {
      nome: nome.toUpperCase(),
      matricula,
      equipe: equipe.toUpperCase(),
      senha: senhaHash,
      role: "GCM",
    }
  })

  // Atualiza a tabela na tela instantaneamente
  revalidatePath("/admin/efetivo")
}