// src/app/admin/escalas/actions.ts
"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function criarEquipe(formData: FormData) {
  const nome = (formData.get("nome") as string)?.trim().toUpperCase()
  const cor = formData.get("cor") as string

  if (!nome) throw new Error("O nome da equipe é obrigatório.")

  await prisma.equipe.upsert({
    where: { nome },
    update: { cor },
    create: { nome, cor }
  })

  revalidatePath("/admin/escalas")
}

export async function excluirEquipe(id: string) {
  await prisma.equipe.delete({ where: { id } })
  revalidatePath("/admin/escalas")
}

export async function definirEscalaOrdinaria(formData: FormData) {
  const dataRaw = formData.get("data") as string
  const equipe = formData.get("equipe") as string

  if (!dataRaw || !equipe) throw new Error("Informe a data e a equipe do plantão ordinário.")

  const data = new Date(dataRaw)
  data.setUTCHours(0, 0, 0, 0)

  await prisma.escalaOrdinaria.upsert({
    where: { data },
    update: { equipe },
    create: { data, equipe }
  })

  revalidatePath("/admin/escalas")
}

export async function excluirEscalaOrdinaria(id: string) {
  await prisma.escalaOrdinaria.delete({ where: { id } })
  revalidatePath("/admin/escalas")
}
