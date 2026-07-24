/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/admin/efetivo/actions.ts
"use server"

import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { gcmSchema } from "@/lib/schemas"

export async function criarGCM(formData: FormData) {
  const dadosBrutos = Object.fromEntries(formData.entries())
  const validacao = gcmSchema.safeParse(dadosBrutos)
  
  if (!validacao.success) {
    const mensagemErro = validacao.error.issues[0]?.message ?? "Dados inválidos"
    throw new Error(mensagemErro)
  }

  const { nome, matricula, equipe, telefone, cnh, role, observacoes, especializacoes } = validacao.data

  const existe = await prisma.usuario.findUnique({
    where: { matricula }
  })

  if (existe) {
    throw new Error("Matrícula já cadastrada no sistema.")
  }

  const senhaHash = await bcrypt.hash("gcm123", 10)

  await prisma.usuario.create({
    data: {
      nome: nome.toUpperCase(),
      matricula,
      equipe: equipe.toUpperCase(),
      senha: senhaHash,
      telefone: telefone || null,
      cnh: cnh || "NÃO",
      role: (role as any) || "GCM",
      observacoes: observacoes || null,
      especializacoes: especializacoes || null,
    }
  })

  revalidatePath("/admin/efetivo")
}

export async function eliminarGCM(id: string) {
  await prisma.convocacao.deleteMany({
    where: { gcmId: id }
  })

  await prisma.usuario.delete({
    where: { id }
  })

  revalidatePath("/admin/efetivo")
}

export async function alterarStatusGCM(id: string, statusAtual: "ATIVO" | "INATIVO") {
  const novoStatus = statusAtual === "ATIVO" ? "INATIVO" : "ATIVO"
  
  await prisma.usuario.update({
    where: { id },
    data: { status: novoStatus as any }
  })

  revalidatePath("/admin/efetivo")
}

export async function atualizarGCM(id: string, formData: FormData) {
  const dadosBrutos = Object.fromEntries(formData.entries())
  const validacao = gcmSchema.safeParse(dadosBrutos)
  
  if (!validacao.success) {
    const mensagemErro = validacao.error.issues[0]?.message ?? "Dados inválidos"
    throw new Error(mensagemErro)
  }

  const { nome, matricula, equipe, novaSenha, telefone, cnh, role, observacoes, especializacoes } = validacao.data

  const dadosAtualizados: any = {
    nome: nome.toUpperCase(),
    matricula,
    equipe: equipe.toUpperCase(),
    telefone: telefone || null,
    cnh: cnh || "NÃO",
    role: (role as any) || "GCM",
    observacoes: observacoes || null,
    especializacoes: especializacoes || null,
  }

  if (novaSenha && novaSenha.trim() !== "") {
    dadosAtualizados.senha = await bcrypt.hash(novaSenha, 10)
  }

  await prisma.usuario.update({
    where: { id },
    data: dadosAtualizados,
  })

  revalidatePath("/admin/efetivo")
  redirect("/admin/efetivo")
}