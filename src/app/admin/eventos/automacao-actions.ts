// src/app/admin/eventos/automacao-actions.ts
"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { StatusConvocacao } from "@prisma/client"
import webpush from "@/lib/webpush" 

// Adicionamos o shouldRevalidate = true no final dos parâmetros
export async function convocarFilaAutomatica(eventoId: string, equipe: string, quantidadeVagas: number, shouldRevalidate = true) {
  try {
    // 0. Busca o evento para saber o SLA configurado (Regra 4)
    const evento = await prisma.evento.findUnique({ where: { id: eventoId } })
    if (!evento) return { erro: "Evento não encontrado." }

    // 1. Busca os GCMs da equipe solicitada, já trazendo a contagem de extras
    // CONFIRMADOS no mês corrente (Regra 2 - Rodízio Justo)
    const inicioMes = new Date()
    inicioMes.setDate(1)
    inicioMes.setHours(0, 0, 0, 0)
    const inicioProximoMes = new Date(inicioMes)
    inicioProximoMes.setMonth(inicioProximoMes.getMonth() + 1)

    const gcmsElegiveis = await prisma.usuario.findMany({
      where: {
        role: { not: "ADMIN" },
        equipe: equipe
      },
      include: {
        _count: {
          select: {
            convocacoes: {
              where: {
                status: StatusConvocacao.CONFIRMADO,
                criadoEm: { gte: inicioMes, lt: inicioProximoMes }
              }
            }
          }
        },
        inscricoesPush: true 
      }
    })

    if (gcmsElegiveis.length === 0) return { erro: "Nenhum Guarda encontrado nesta equipe." }

    // Regra 3 - Critério de Desempate: menor número de extras confirmados no mês
    // e, em empate, maior antiguidade (menor matrícula)
    gcmsElegiveis.sort((a, b) => {
      if (a._count.convocacoes !== b._count.convocacoes) {
        return a._count.convocacoes - b._count.convocacoes
      }
      return a.matricula.localeCompare(b.matricula, undefined, { numeric: true })
    })

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

    // 3. Cria as convocações no banco, já com o prazo de SLA (Regra 4)
    const dataLimiteSla = evento.slaMinutos
      ? new Date(Date.now() + evento.slaMinutos * 60_000)
      : null

    const novasConvocacoes = selecionados.map(gcm => ({
      eventoId,
      gcmId: gcm.id,
      status: StatusConvocacao.PENDENTE,
      dataLimiteSla
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

    for (const guarda of selecionados) {
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
        }
      }
    }

    // TRAVA DO REVALIDATE
    if (shouldRevalidate) {
      revalidatePath(`/admin/eventos/${eventoId}`)
    }
    
    return { 
      sucesso: true, 
      mensagem: `${selecionados.length} Guarda(s) convocado(s) com sucesso! Notificações enviadas.` 
    }

  } catch (error) {
    console.error("Erro na automação:", error)
    return { erro: "Erro interno ao tentar convocar a fila." }
  }
}

// Adicionamos o parâmetro aqui também
export async function expirarConvocacoesVencidas(shouldRevalidate = true) {
  const vencidas = await prisma.convocacao.findMany({
    where: {
      status: StatusConvocacao.PENDENTE,
      dataLimiteSla: { lt: new Date() }
    },
    include: { gcm: true, evento: true }
  })

  for (const convocacao of vencidas) {
    await prisma.convocacao.update({
      where: { id: convocacao.id },
      data: { status: StatusConvocacao.EXPIRADO }
    })

    await prisma.notificacao.create({
      data: {
        titulo: "Convocação Expirada (SLA)",
        mensagem: `O prazo de resposta do GCM ${convocacao.gcm.nome} para a missão ${convocacao.evento.codigo} expirou. O próximo da fila foi acionado.`,
        tipo: "AVISO"
      }
    })

    if (convocacao.gcm.equipe) {
      // Repassamos o shouldRevalidate para a função filha não estourar o erro!
      await convocarFilaAutomatica(convocacao.eventoId, convocacao.gcm.equipe, 1, shouldRevalidate)
    }
  }

  // TRAVA DO REVALIDATE
  if (vencidas.length > 0 && shouldRevalidate) {
    revalidatePath(`/admin/eventos`)
  }

  return { verificadas: vencidas.length }
}