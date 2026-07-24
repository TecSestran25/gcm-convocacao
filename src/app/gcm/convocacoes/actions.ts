// src/app/gcm/convocacoes/actions.ts
"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { convocarFilaAutomatica } from "@/app/admin/eventos/automacao-actions"

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

  // 2. Trava contra cliques repetidos
  if (respostaExistente && respostaExistente.status === status) {
    return
  }

  // 3. Ajuste do Fuso Horário (UTC-3 para o horário de Brasília)
  const dataBrasilia = new Date()
  dataBrasilia.setHours(dataBrasilia.getHours() - 3)

  // 4. Grava ou atualiza a resposta no banco de dados
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

  // 5. Busca os dados do GCM e do Evento
  const usuario = await prisma.usuario.findUnique({ where: { id: gcmId } })
  const evento = await prisma.evento.findUnique({ where: { id: eventoId } })

  // 6. Dispara a notificação padrão para o Comando
  await prisma.notificacao.create({
    data: {
      titulo: status === "ACEITO" ? "Nova Adesão Operacional" : "Recusa de Escala",
      mensagem: `O GCM ${usuario?.nome || 'Desconhecido'} ${status === "ACEITO" ? "ACEITOU" : "RECUSOU"} a convocação para a missão ${evento?.codigo || 'Desconhecida'}.`,
      tipo: status === "ACEITO" ? "SUCESSO" : "AVISO"
    }
  })

  // ==============================================================
  // 7. GATILHO DA SUBSTITUIÇÃO AUTOMÁTICA (ITEM 7 DO ESCOPO)
  // ==============================================================
  if (status === "RECUSADO" && usuario?.equipe) {
    // Tenta convocar 1 pessoa da mesma equipe do guarda que recusou
    const substituicao = await convocarFilaAutomatica(eventoId, usuario.equipe, 1)

    // Se encontrou alguém e convocou com sucesso, avisa o comando
    if (substituicao.sucesso) {
      await prisma.notificacao.create({
        data: {
          titulo: "Substituição Automática",
          mensagem: `Devido à recusa, o sistema convocou automaticamente o próximo da fila (Equipe ${usuario.equipe}) para a missão ${evento?.codigo || ''}.`,
          tipo: "INFO" 
        }
      })
    }
  }

  // 8. Atualiza as telas em tempo real
  revalidatePath("/gcm/convocacoes")
  revalidatePath(`/admin/eventos/${eventoId}`)
}