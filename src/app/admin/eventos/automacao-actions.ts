// src/app/admin/eventos/automacao-actions.ts
"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { StatusConvocacao } from "@prisma/client"
import webpush from "@/lib/webpush" // <-- Importamos o disparador

export async function convocarFilaAutomatica(eventoId: string, equipe: string, quantidadeVagas: number) {
  try {
    // 1. Busca os GCMs da equipe solicitada
    const gcmsElegiveis = await prisma.usuario.findMany({
      where: { 
        role: { not: "ADMIN" }, 
        equipe: equipe 
      },
      include: {
        _count: { select: { convocacoes: true } },
        inscricoesPush: true // <-- Trazemos os celulares registrados de cada guarda
      },
      orderBy: {
        convocacoes: { _count: 'asc' }
      },
    })

    if (gcmsElegiveis.length === 0) return { erro: "Nenhum Guarda encontrado nesta equipe." }

    // 2. Filtra quem já está convocado
    const jaConvocados = await prisma.convocacao.findMany({
      where: { eventoId },
      select: { gcmId: true }
    })
    const idsJaConvocados = jaConvocados.map(c => c.gcmId)

    const gcmsDisponiveis = gcmsElegiveis.filter(gcm => !idsJaConvocados.includes(gcm.id))
    const selecionados = gcmsDisponiveis.slice(0, quantidadeVagas)

    if (selecionados.length === 0) {
      return { erro: "Todos os Guardas desta equipe já foram convocados ou não há efetivo suficiente." }
    }

    // 3. Cria as convocações no banco
    const novasConvocacoes = selecionados.map(gcm => ({
      eventoId,
      gcmId: gcm.id,
      status: StatusConvocacao.PENDENTE
    }))

    await prisma.convocacao.createMany({
      data: novasConvocacoes,
      skipDuplicates: true,
    })

    // 4. =========================================================
    // DISPARO DE NOTIFICAÇÕES PUSH PARA OS CELULARES SELECIONADOS
    // =========================================================
    const payloadNotificacao = JSON.stringify({
      title: "Nova Escala GCM Goiana",
      body: "Você foi escalado para uma nova missão! Acesse o painel para confirmar sua presença.",
      url: "/gcm/convocacoes"
    })

    // Percorre todos os guardas que foram selecionados agora
    for (const guarda of selecionados) {
      // Se ele ativou a notificação no celular, nós disparamos
      for (const inscricao of guarda.inscricoesPush) {
        try {
          await webpush.sendNotification({
            endpoint: inscricao.endpoint,
            keys: {
              auth: inscricao.auth,
              p256dh: inscricao.p256dh
            }
          }, payloadNotificacao)
        } catch (pushError) {
          console.error(`Falha ao enviar push para ${guarda.nome}:`, pushError)
          // Se der erro (ex: guarda trocou de celular), você pode adicionar código no futuro para apagar a inscrição velha do banco.
        }
      }
    }

    revalidatePath(`/admin/eventos/${eventoId}`)
    
    return { 
      sucesso: true, 
      mensagem: `${selecionados.length} Guarda(s) convocado(s) com sucesso! Notificações enviadas.` 
    }

  } catch (error) {
    console.error("Erro na automação:", error)
    return { erro: "Erro interno ao tentar convocar a fila." }
  }
}