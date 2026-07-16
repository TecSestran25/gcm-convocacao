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

  // 1. Busca se o guarda já respondeu a este evento antes
  const respostaExistente = await prisma.convocacao.findUnique({
    where: {
      eventoId_gcmId: { eventoId, gcmId }
    }
  })

  // 2. Trava contra cliques repetidos: se o status atual já for igual ao que ele clicou, não faz nada
  if (respostaExistente && respostaExistente.status === status) {
    return
  }

  // 3. Ajuste do Fuso Horário (UTC-3 para o horário de Brasília)
  const dataBrasilia = new Date()
  dataBrasilia.setHours(dataBrasilia.getHours() - 3)

  // 4. Grava ou atualiza a resposta no banco de dados com a data corrigida
  await prisma.convocacao.upsert({
    where: {
      eventoId_gcmId: { eventoId, gcmId }
    },
    update: {
      status,
      dataResposta: dataBrasilia
    },
    create: {
      eventoId,
      gcmId,
      status,
      dataResposta: dataBrasilia
    }
  })

  // 5. Busca os dados do GCM e do Evento para criar uma notificação rica
  const usuario = await prisma.usuario.findUnique({ where: { id: gcmId } })
  const evento = await prisma.evento.findUnique({ where: { id: eventoId } })

  // 6. Dispara a notificação para o Comando (Sininho)
  await prisma.notificacao.create({
    data: {
      titulo: status === "ACEITO" ? "Nova Adesão Operacional" : "Recusa de Escala",
      mensagem: `O GCM ${usuario?.nome || 'Desconhecido'} ${status === "ACEITO" ? "ACEITOU" : "RECUSOU"} a convocação para a missão ${evento?.codigo || 'Desconhecida'}.`,
      tipo: status === "ACEITO" ? "SUCESSO" : "AVISO" // <-- Mudamos para AVISO aqui
    }
  })

  // 7. Força a atualizar os dados na tela do GCM e na tela de detalhes do Comando
  revalidatePath("/gcm/convocacoes")
  revalidatePath(`/admin/eventos/${eventoId}`)
}