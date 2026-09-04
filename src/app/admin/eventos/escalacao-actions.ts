// src/app/admin/eventos/escalacao-actions.ts
// Motor de convocação: o Comando notifica o(s) Líder(es) responsável(is),
// que escolhem manualmente os GCMs da própria equipe (sem convocação individual
// com aceite/recusa).
"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { StatusConvocacao } from "@prisma/client"
import webpush from "@/lib/webpush"
import { buscarEquipeOrdinaria, STATUS_OCUPA_VAGA } from "@/lib/escala-ordinaria"

// Notifica os Líderes/Supervisores delegados (Evento.validadores) para que preencham as vagas
export async function notificarLideresParaEscalar(eventoId: string) {
  const evento = await prisma.evento.findUnique({
    where: { id: eventoId },
    include: { validadores: { include: { inscricoesPush: true } } }
  })
  if (!evento) return

  await prisma.notificacao.create({
    data: {
      titulo: "Nova Escala para Preencher",
      mensagem: `O(s) responsável(is) foi(ram) designado(s) para preencher ${evento.vagas} vaga(s) da missão ${evento.codigo} (Equipe ${evento.equipePrioritaria}).`,
      tipo: "INFO"
    }
  })

  const payload = JSON.stringify({
    title: "Nova Escala para Preencher",
    body: `Preencha as vagas da missão ${evento.codigo} (Equipe ${evento.equipePrioritaria}).`,
    url: `/gcm/escalar/${eventoId}`
  })

  for (const lider of evento.validadores) {
    for (const inscricao of lider.inscricoesPush) {
      try {
        await webpush.sendNotification({
          endpoint: inscricao.endpoint,
          keys: { auth: inscricao.auth, p256dh: inscricao.p256dh }
        }, payload)
      } catch (pushError) {
        console.error(`Falha ao enviar push para ${lider.nome}:`, pushError)
      }
    }
  }
}

// Lista os GCMs elegíveis de uma equipe, ordenados por equidade (menos extras
// confirmados no mês primeiro, desempate por antiguidade), com a contagem de
// extras exposta como anotação para o Líder decidir.
export async function listarGcmsElegiveisParaEscalar(eventoId: string, equipe: string) {
  const evento = await prisma.evento.findUnique({ where: { id: eventoId } })
  if (!evento) return { erro: "Evento não encontrado." }

  const equipeOrdinaria = await buscarEquipeOrdinaria(evento.dataServico)
  if (equipeOrdinaria && equipeOrdinaria === equipe) {
    return { erro: `A equipe ${equipe} está de plantão ordinário neste dia e não pode ser escalada.` }
  }

  const inicioMes = new Date()
  inicioMes.setDate(1)
  inicioMes.setHours(0, 0, 0, 0)
  const inicioProximoMes = new Date(inicioMes)
  inicioProximoMes.setMonth(inicioProximoMes.getMonth() + 1)

  const [gcms, jaConvocados] = await Promise.all([
    prisma.usuario.findMany({
      where: { role: "GCM", equipe, status: "ATIVO" },
      select: {
        id: true,
        nome: true,
        matricula: true,
        _count: {
          select: {
            convocacoes: {
              where: {
                status: { in: [StatusConvocacao.CONFIRMADO, StatusConvocacao.PRESENTE] },
                criadoEm: { gte: inicioMes, lt: inicioProximoMes }
              }
            }
          }
        }
      }
    }),
    prisma.convocacao.findMany({ where: { eventoId }, select: { gcmId: true } })
  ])

  const idsJaConvocados = new Set(jaConvocados.map(c => c.gcmId))

  gcms.sort((a, b) => {
    if (a._count.convocacoes !== b._count.convocacoes) {
      return a._count.convocacoes - b._count.convocacoes
    }
    return a.matricula.localeCompare(b.matricula, undefined, { numeric: true })
  })

  return {
    sucesso: true,
    gcms: gcms.map(g => ({
      id: g.id,
      nome: g.nome,
      matricula: g.matricula,
      extrasNoMes: g._count.convocacoes,
      jaConvocado: idsJaConvocados.has(g.id)
    }))
  }
}

// O Líder/Supervisor delegado escolhe manualmente os GCMs que cobrirão as vagas.
// A convocação já nasce CONFIRMADO (escala oficial) — não há etapa de aceite/recusa.
export async function escalarGuardas(eventoId: string, gcmIds: string[]) {
  const session = await auth()
  const validadorId = session?.user?.id
  const role = session?.user?.role

  if (!validadorId || (role !== "LIDER" && role !== "SUPERVISOR")) {
    return { erro: "Apenas Líderes ou Supervisores podem escalar guardas." }
  }

  if (gcmIds.length === 0) {
    return { erro: "Selecione ao menos um guarda para escalar." }
  }

  const evento = await prisma.evento.findUnique({
    where: { id: eventoId },
    include: { convocacoes: true, validadores: { select: { id: true } } }
  })
  if (!evento) return { erro: "Evento não encontrado." }

  const autorizado = evento.validadores.some(v => v.id === validadorId)
  if (!autorizado) {
    return { erro: "Você não foi delegado como responsável por este evento." }
  }

  const vagasOcupadas = evento.convocacoes.filter(c => c.status !== StatusConvocacao.TROCA).length
  const vagasRestantes = Math.max(0, evento.vagas - vagasOcupadas)
  if (gcmIds.length > vagasRestantes) {
    return { erro: `Você selecionou ${gcmIds.length} guarda(s), mas só há ${vagasRestantes} vaga(s) disponível(is).` }
  }

  const gcms = await prisma.usuario.findMany({ where: { id: { in: gcmIds } } })
  const equipeOrdinaria = await buscarEquipeOrdinaria(evento.dataServico)

  for (const gcm of gcms) {
    if (equipeOrdinaria && gcm.equipe === equipeOrdinaria) {
      return { erro: `${gcm.nome} é da equipe ${equipeOrdinaria}, que está de plantão ordinário nesta data e não pode ser escalada.` }
    }
  }

  await prisma.convocacao.createMany({
    data: gcmIds.map(gcmId => ({ eventoId, gcmId, status: StatusConvocacao.CONFIRMADO })),
    skipDuplicates: true
  })

  await prisma.notificacao.create({
    data: {
      titulo: "Escala Preenchida pelo Líder",
      mensagem: `${gcms.length} guarda(s) escalado(s) pelo responsável para a missão ${evento.codigo}.`,
      tipo: "INFO"
    }
  })

  revalidatePath(`/admin/eventos/${eventoId}`)
  revalidatePath(`/gcm/escalar/${eventoId}`)
  revalidatePath(`/gcm/escalar`)

  return { sucesso: true, mensagem: `${gcms.length} guarda(s) escalado(s) com sucesso.` }
}

// Regra 4 (nova versão): se o prazo do Líder vencer e ainda houver vaga aberta,
// avisa o Comando em vez de escalonar sozinho — a decisão de estender o prazo ou
// repassar para a próxima equipe/líder é manual.
export async function verificarPrazosDeEscalacao(shouldRevalidate = true) {
  const eventosVencidos = await prisma.evento.findMany({
    where: {
      dataLimiteEscalacao: { lt: new Date() },
      avisoPrazoEnviado: false
    },
    include: { convocacoes: true }
  })

  let avisados = 0

  for (const evento of eventosVencidos) {
    const vagasPreenchidas = evento.convocacoes.filter(c => STATUS_OCUPA_VAGA.includes(c.status)).length

    if (vagasPreenchidas < evento.vagas) {
      await prisma.notificacao.create({
        data: {
          titulo: "Prazo de Escalação Vencido",
          mensagem: `A missão ${evento.codigo} (Equipe ${evento.equipePrioritaria}) tem ${evento.vagas - vagasPreenchidas} vaga(s) ainda não preenchida(s) e o prazo do Líder responsável venceu. Avalie estender o prazo ou escalonar para a próxima equipe.`,
          tipo: "AVISO"
        }
      })
      avisados++
    }

    await prisma.evento.update({ where: { id: evento.id }, data: { avisoPrazoEnviado: true } })
  }

  if (avisados > 0 && shouldRevalidate) {
    revalidatePath(`/admin/eventos`)
    revalidatePath(`/admin/dashboard`)
  }

  return { verificados: eventosVencidos.length, avisados }
}
