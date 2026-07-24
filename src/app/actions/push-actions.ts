"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function salvarInscricaoPush(subscription: any) {
  const session = await auth()
  if (!session?.user?.id) return { erro: "Não autorizado" }

  const { endpoint, keys } = subscription

  // Salva ou atualiza o aparelho do Guarda no banco de dados
  await prisma.pushSubscription.upsert({
    where: { endpoint },
    update: {
      p256dh: keys.p256dh,
      auth: keys.auth,
      usuarioId: session.user.id
    },
    create: {
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      usuarioId: session.user.id
    }
  })

  return { sucesso: true }
}