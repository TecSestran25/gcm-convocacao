// src/app/admin/eventos/actions.ts
"use server"

import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { eventoSchema } from "@/lib/schemas"

// Motor novo: notifica o(s) Líder(es) responsável(is) para que preencham as vagas manualmente
import { notificarLideresParaEscalar } from "./escalacao-actions"

export async function criarEvento(formData: FormData) {
  const dataServico = new Date(formData.get("dataServico") as string)
  const horario = formData.get("horario") as string
  const local = formData.get("local") as string
  const vagas = parseInt(formData.get("vagas") as string)
  const equipePrioritaria = formData.get("equipePrioritaria") as string
  const slaMinutosRaw = formData.get("slaMinutos") as string | null
  const slaMinutos = slaMinutosRaw ? parseInt(slaMinutosRaw, 10) : null

  // Sequência de escalonamento: próximas equipes, em ordem, além da Equipe Alvo
  const sequenciaEscalonamento = [1, 2, 3]
    .map((posicao) => formData.get(`escalonamento${posicao}`) as string | null)
    .filter((equipe): equipe is string => !!equipe && equipe !== equipePrioritaria)

  // Delegação: obrigatório indicar ao menos um líder/supervisor responsável por
  // preencher as vagas e, depois, validar a presença deste evento
  const validadoresIds = formData.getAll("validadores").map(String).filter(Boolean)
  if (validadoresIds.length === 0) {
    throw new Error("Selecione ao menos um Líder ou Supervisor responsável por este evento.")
  }

  // Prazo para o(s) Líder(es) preencherem as vagas (Regra 4 - nova versão)
  const dataLimiteEscalacao = slaMinutos ? new Date(Date.now() + slaMinutos * 60_000) : null

  // Busca o último evento criado no banco para saber o número
  const ultimoEvento = await prisma.evento.findFirst({
    orderBy: { criadoEm: 'desc' }
  })

  // Lógica para gerar o próximo número (GECP_00000001)
  let proximoNumero = 1
  
  if (ultimoEvento && ultimoEvento.codigo.startsWith('GECP_')) {
    const numeroAtual = parseInt(ultimoEvento.codigo.replace('GECP_', ''), 10)
    if (!isNaN(numeroAtual)) {
      proximoNumero = numeroAtual + 1
    }
  }

  const novoCodigo = `GECP_${proximoNumero.toString().padStart(8, '0')}`

  // 1. Salva no banco e CAPTURA O NOVO EVENTO em uma variável
  const novoEvento = await prisma.evento.create({
    data: {
      codigo: novoCodigo,
      dataServico,
      horario,
      local,
      vagas,
      equipePrioritaria,
      sequenciaEscalonamento,
      slaMinutos,
      dataLimiteEscalacao,
      validadores: { connect: validadoresIds.map(id => ({ id })) }
    }
  })

  // =========================================================
  // 2. NOTIFICA O(S) LÍDER(ES) RESPONSÁVEL(IS) PARA PREENCHER AS VAGAS
  // =========================================================
  await notificarLideresParaEscalar(novoEvento.id)

  // 3. Disparar uma notificação informando a criação do evento no painel
  await prisma.notificacao.create({
    data: {
      titulo: "Nova Convocação Criada",
      mensagem: `A missão ${novoCodigo} foi gerada para a equipe ${equipePrioritaria}. O(s) responsável(is) foi(ram) notificado(s) para preencher as vagas.`,
      tipo: "INFO"
    }
  })

  revalidatePath("/admin/eventos")
  revalidatePath("/admin/dashboard")
  redirect('/admin/eventos')
}

export async function eliminarEvento(id: string) {
  // Elimina primeiro todas as respostas dos guardas associadas a este evento
  await prisma.convocacao.deleteMany({
    where: { eventoId: id }
  })

  // Elimina o evento principal
  await prisma.evento.delete({
    where: { id }
  })

  revalidatePath("/admin/eventos")
}

export async function atualizarEvento(id: string, formData: FormData) {
  const dadosBrutos = Object.fromEntries(formData.entries())
  const validacao = eventoSchema.safeParse(dadosBrutos)

  if (!validacao.success) {
    const mensagemErro = validacao.error.issues[0]?.message ?? "Dados inválidos"
    throw new Error(mensagemErro)
  }

  const { codigo, dataServico, horario, local, vagas, equipePrioritaria, slaMinutos } = validacao.data
  const equipePrioritariaFinal = equipePrioritaria.toUpperCase()

  // Campos de múltipla escolha não sobrevivem ao Object.fromEntries acima (fica só o último valor),
  // por isso são lidos direto do FormData
  const sequenciaEscalonamento = [1, 2, 3]
    .map((posicao) => formData.get(`escalonamento${posicao}`) as string | null)
    .filter((equipe): equipe is string => !!equipe && equipe !== equipePrioritariaFinal)

  const validadoresIds = formData.getAll("validadores").map(String).filter(Boolean)
  if (validadoresIds.length === 0) {
    throw new Error("Selecione ao menos um Líder ou Supervisor responsável por este evento.")
  }

  // Recalcula o prazo do Líder a partir de agora (permite "estender o prazo" editando o evento)
  // e reabre o aviso de prazo vencido para ser reavaliado contra o novo prazo
  const dataLimiteEscalacao = slaMinutos ? new Date(Date.now() + slaMinutos * 60_000) : null

  await prisma.evento.update({
    where: { id },
    data: {
      codigo: codigo.toUpperCase(),
      dataServico: new Date(dataServico),
      horario,
      local: local.toUpperCase(),
      equipePrioritaria: equipePrioritariaFinal,
      sequenciaEscalonamento,
      vagas,
      slaMinutos: slaMinutos ?? null,
      dataLimiteEscalacao,
      avisoPrazoEnviado: false,
      validadores: { set: validadoresIds.map(id => ({ id })) }
    }
  })

  // Renotifica os responsáveis (cobre tanto a extensão de prazo quanto a
  // reatribuição manual para um novo Líder/equipe ao editar o evento)
  await notificarLideresParaEscalar(id)

  revalidatePath("/admin/eventos")
  redirect("/admin/eventos")
}