// src/app/admin/eventos/presenca-actions.ts
"use server"

import { prisma } from "@/lib/prisma"
import type { StatusConvocacao } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function registrarPresenca(eventoId: string, gcmId: string, novoStatus: StatusConvocacao) {
  // Atualiza o status do guarda na missão específica
  await prisma.convocacao.update({
    where: {
      eventoId_gcmId: { eventoId, gcmId }
    },
    data: {
      status: novoStatus
    }
  })

  // Pode opcionalmente gerar uma notificação silenciosa aqui se quiser
  // (ex: para alimentar futuros relatórios)

  // Atualiza a tela de detalhes do evento imediatamente
  revalidatePath(`/admin/eventos/${eventoId}`)
}