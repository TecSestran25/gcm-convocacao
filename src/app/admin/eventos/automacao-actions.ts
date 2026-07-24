// src/app/admin/eventos/automacao-actions.ts
"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { StatusConvocacao } from "@prisma/client" // <-- Adicionamos a importação do Enum do Prisma

export async function convocarFilaAutomatica(eventoId: string, equipe: string, quantidadeVagas: number) {
  try {
    // 1. Busca os GCMs da equipe solicitada
    const gcmsElegiveis = await prisma.usuario.findMany({
      where: { 
        role: "GCM", 
        equipe: equipe 
      },
      include: {
        _count: {
          select: { convocacoes: true }
        }
      },
      orderBy: {
        convocacoes: {
          _count: 'asc' // Fila justa: quem tem menos extras vai para o topo da lista
        }
      },
    })

    if (gcmsElegiveis.length === 0) {
      return { erro: "Nenhum Guarda encontrado nesta equipe." }
    }

    // 2. Filtra para remover quem JÁ ESTÁ convocado para este evento específico
    const jaConvocados = await prisma.convocacao.findMany({
      where: { eventoId },
      select: { gcmId: true }
    })
    const idsJaConvocados = jaConvocados.map(c => c.gcmId)

    const gcmsDisponiveis = gcmsElegiveis.filter(gcm => !idsJaConvocados.includes(gcm.id))

    // 3. Pega apenas a quantidade exata de vagas solicitadas
    const selecionados = gcmsDisponiveis.slice(0, quantidadeVagas)

    if (selecionados.length === 0) {
      return { erro: "Todos os Guardas desta equipe já foram convocados ou não há efetivo suficiente." }
    }

    // 4. Cria as convocações no status PENDENTE usando o tipo correto do Prisma
    const novasConvocacoes = selecionados.map(gcm => ({
      eventoId,
      gcmId: gcm.id,
      status: StatusConvocacao.PENDENTE // <-- Usamos o Enum tipado em vez de uma string solta
    }))

    await prisma.convocacao.createMany({
      data: novasConvocacoes,
      skipDuplicates: true,
    })

    revalidatePath(`/admin/eventos/${eventoId}`)
    
    return { 
      sucesso: true, 
      mensagem: `${selecionados.length} Guarda(s) convocado(s) com sucesso!` 
    }

  } catch (error) {
    console.error("Erro na automação:", error)
    return { erro: "Erro interno ao tentar convocar a fila." }
  }
}