// src/app/admin/eventos/actions.ts
"use server"

import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { eventoSchema } from "@/lib/schemas"

export async function criarEvento(formData: FormData) {
  // 1. Não pegamos mais o código do formulário
  const dataServico = new Date(formData.get("dataServico") as string)
  const horario = formData.get("horario") as string
  const local = formData.get("local") as string
  const vagas = parseInt(formData.get("vagas") as string)
  const equipePrioritaria = formData.get("equipePrioritaria") as string

  // 2. Busca o último evento criado no banco para saber o número
  const ultimoEvento = await prisma.evento.findFirst({
    orderBy: {
      criadoEm: 'desc'
    }
  })

  // 3. Lógica para gerar o próximo número (GECP_00000001)
  let proximoNumero = 1
  
  if (ultimoEvento && ultimoEvento.codigo.startsWith('GECP_')) {
    // Extrai apenas os números do código antigo (ex: "00000005" -> 5) e soma 1
    const numeroAtual = parseInt(ultimoEvento.codigo.replace('GECP_', ''), 10)
    if (!isNaN(numeroAtual)) {
      proximoNumero = numeroAtual + 1
    }
  }

  // Formata o número com 8 dígitos (adiciona os zeros à esquerda)
  const novoCodigo = `GECP_${proximoNumero.toString().padStart(8, '0')}`

  // 4. Salva no banco com o código automático
  await prisma.evento.create({
    data: {
      codigo: novoCodigo,
      dataServico,
      horario,
      local,
      vagas,
      equipePrioritaria
    }
  })

  // 5. Opcional: Disparar uma notificação informando a criação do evento
  await prisma.notificacao.create({
    data: {
      titulo: "Nova Convocação Criada",
      mensagem: `A missão ${novoCodigo} foi gerada para a equipe ${equipePrioritaria}.`,
      tipo: "INFO"
    }
  })

  revalidatePath("/admin/eventos")
  revalidatePath("/admin/dashboard")
}

export async function eliminarEvento(id: string) {
  // 1. Elimina primeiro todas as respostas dos guardas associadas a este evento
  await prisma.convocacao.deleteMany({
    where: { eventoId: id }
  })

  // 2. Elimina o evento principal
  await prisma.evento.delete({
    where: { id }
  })

  // 3. Atualiza a lista
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

  const { codigo, dataServico, horario, local, vagas, equipePrioritaria } = validacao.data

  await prisma.evento.update({
    where: { id },
    data: {
      codigo: codigo.toUpperCase(),
      dataServico: new Date(dataServico),
      horario,
      local: local.toUpperCase(),
      vagas,
      equipePrioritaria: equipePrioritaria.toUpperCase(),
    }
  })

  revalidatePath("/admin/eventos")
  redirect("/admin/eventos")
}