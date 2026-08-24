// src/app/admin/eventos/actions.ts
"use server"

import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { eventoSchema } from "@/lib/schemas"

// Importamos o motor de automação que dispara os Pushs e cria a fila
import { convocarFilaAutomatica } from "./automacao-actions" 

export async function criarEvento(formData: FormData) {
  const dataServico = new Date(formData.get("dataServico") as string)
  const horario = formData.get("horario") as string
  const local = formData.get("local") as string
  const vagas = parseInt(formData.get("vagas") as string)
  const equipePrioritaria = formData.get("equipePrioritaria") as string
  const slaMinutosRaw = formData.get("slaMinutos") as string | null
  const slaMinutos = slaMinutosRaw ? parseInt(slaMinutosRaw, 10) : null

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
      slaMinutos
    }
  })

  // =========================================================
  // 2. GATILHO DA CONVOCAÇÃO AUTOMÁTICA
  // =========================================================
  // Só dispara se o alvo for uma equipe específica. 
  // (Evita erro se o Comando selecionar "GERAL" ou "TODAS")
  if (equipePrioritaria !== "TODAS" && equipePrioritaria !== "GERAL") {
    // Chama exatamente a quantidade de vagas solicitadas e já dispara os Pushs!
    await convocarFilaAutomatica(novoEvento.id, equipePrioritaria, vagas)
  }

  // 3. Disparar uma notificação informando a criação do evento no painel
  await prisma.notificacao.create({
    data: {
      titulo: "Nova Convocação Criada",
      mensagem: `A missão ${novoCodigo} foi gerada para a equipe ${equipePrioritaria} e a fila foi acionada.`,
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

export async function homologarGuarda(eventoId: string, gcmId: string) {
  // Passa o guarda para a escala oficial
  await prisma.convocacao.update({
    where: {
      eventoId_gcmId: { eventoId, gcmId }
    },
    data: { status: "CONFIRMADO" }
  })

  revalidatePath(`/admin/eventos/${eventoId}`)
}

export async function removerHomologacao(eventoId: string, gcmId: string) {
  // Retira o guarda da escala oficial e devolve para a fila de espera
  await prisma.convocacao.update({
    where: {
      eventoId_gcmId: { eventoId, gcmId }
    },
    data: { status: "ACEITO" }
  })

  revalidatePath(`/admin/eventos/${eventoId}`)
}

export async function atualizarEvento(id: string, formData: FormData) {
  const dadosBrutos = Object.fromEntries(formData.entries())
  const validacao = eventoSchema.safeParse(dadosBrutos)

  if (!validacao.success) {
    const mensagemErro = validacao.error.issues[0]?.message ?? "Dados inválidos"
    throw new Error(mensagemErro)
  }

  const { codigo, dataServico, horario, local, vagas, equipePrioritaria, slaMinutos } = validacao.data

  await prisma.evento.update({
    where: { id },
    data: {
      codigo: codigo.toUpperCase(),
      dataServico: new Date(dataServico),
      horario,
      local: local.toUpperCase(),
      vagas,
      equipePrioritaria: equipePrioritaria.toUpperCase(),
      slaMinutos: slaMinutos ?? null,
    }
  })

  revalidatePath("/admin/eventos")
  redirect("/admin/eventos")
}