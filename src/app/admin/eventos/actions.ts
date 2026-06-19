// src/app/admin/eventos/actions.ts
"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function criarEvento(formData: FormData) {
  const codigo = formData.get("codigo") as string
  const dataServico = formData.get("dataServico") as string
  const horario = formData.get("horario") as string
  const local = formData.get("local") as string
  const vagas = parseInt(formData.get("vagas") as string, 10)
  const equipePrioritaria = formData.get("equipePrioritaria") as string

  // Criação do evento no banco de dados
  await prisma.evento.create({
    data: {
      codigo: codigo.toUpperCase(),
      dataServico: new Date(dataServico), // Converte string para data real
      horario,
      local: local.toUpperCase(),
      vagas,
      equipePrioritaria: equipePrioritaria.toUpperCase(),
    }
  })

  // Atualiza a tela instantaneamente
  revalidatePath("/admin/eventos")
}