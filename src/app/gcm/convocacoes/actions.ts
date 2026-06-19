// src/app/gcm/convocacoes/actions.ts
"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function responderConvocacao(eventoId: string, status: "ACEITO" | "RECUSADO") {
  const session = await auth()
  
  if (!session?.user?.id) {
    throw new Error("Sessão inválida ou expirada.")
  }

  const gcmId = session.user.id

  // Grava ou atualiza a resposta no banco de dados
  await prisma.convocacao.upsert({
    where: {
      eventoId_gcmId: { eventoId, gcmId }
    },
    update: {
      status,
      dataResposta: new Date()
    },
    create: {
      eventoId,
      gcmId,
      status,
      dataResposta: new Date()
    }
  })

  // Força o ecrã a atualizar os dados na hora
  revalidatePath("/gcm/convocacoes")
}