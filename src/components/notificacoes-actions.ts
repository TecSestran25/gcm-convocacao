// src/components/notificacoes-actions.ts
"use server"

import { prisma } from "@/lib/prisma"

// Busca as últimas 20 notificações
export async function buscarHistoricoNotificacoes() {
  return await prisma.notificacao.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20
  })
}

// Marca todas as notificações como lidas (apaga a bolinha vermelha)
export async function marcarTodasComoLidas() {
  await prisma.notificacao.updateMany({
    where: { lida: false },
    data: { lida: true }
  })
}