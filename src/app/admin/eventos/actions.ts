// src/app/admin/eventos/actions.ts
"use server"

import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { eventoSchema } from "@/lib/schemas"

export async function criarEvento(formData: FormData) {
  const dadosBrutos = Object.fromEntries(formData.entries())
  const validacao = eventoSchema.safeParse(dadosBrutos)

  if (!validacao.success) {
    const mensagemErro = validacao.error.issues[0]?.message ?? "Dados inválidos"
    throw new Error(mensagemErro)
  }

  const { codigo, dataServico, horario, local, vagas, equipePrioritaria } = validacao.data

  await prisma.evento.create({
    data: {
      codigo: codigo.toUpperCase(),
      dataServico: new Date(dataServico),
      horario,
      local: local.toUpperCase(),
      vagas,
      equipePrioritaria: equipePrioritaria.toUpperCase(),
    }
  })

  revalidatePath("/admin/eventos")
}

export async function eliminarEvento(id: string) {
  // 1. Elimina primeiro todas as respostas dos guardas associadas a este evento
  await prisma.convocacao.deleteMany({
    where: { eventoId: id }
  })

  // 2. Elimina o evento principal
  await prisma.evento.delete({
    where: { id }
  })

  // 3. Atualiza a lista
  revalidatePath("/admin/eventos")
}
export async function homologarGuarda(eventoId: string, gcmId: string) {
  // Passa o guarda para a escala oficial
  await prisma.convocacao.update({
    where: {
      eventoId_gcmId: { eventoId, gcmId }
    },
    data: { status: "CONFIRMADO" }
  })

  revalidatePath(`/admin/eventos/${eventoId}`)
}
export async function removerHomologacao(eventoId: string, gcmId: string) {
  // Retira o guarda da escala oficial e devolve para a fila de espera
  await prisma.convocacao.update({
    where: {
      eventoId_gcmId: { eventoId, gcmId }
    },
    data: { status: "ACEITO" }
  })

  revalidatePath(`/admin/eventos/${eventoId}`)
}
export async function atualizarEvento(id: string, formData: FormData) {
  const dadosBrutos = Object.fromEntries(formData.entries())
  const validacao = eventoSchema.safeParse(dadosBrutos)

  if (!validacao.success) {
    const mensagemErro = validacao.error.issues[0]?.message ?? "Dados inválidos"
    throw new Error(mensagemErro)
  }

  const { codigo, dataServico, horario, local, vagas, equipePrioritaria } = validacao.data

  await prisma.evento.update({
    where: { id },
    data: {
      codigo: codigo.toUpperCase(),
      dataServico: new Date(dataServico),
      horario,
      local: local.toUpperCase(),
      vagas,
      equipePrioritaria: equipePrioritaria.toUpperCase(),
    }
  })

  revalidatePath("/admin/eventos")
  redirect("/admin/eventos")
}