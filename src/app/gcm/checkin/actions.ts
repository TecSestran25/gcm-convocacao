// src/app/gcm/checkin/actions.ts
"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function registrarCheckin(eventoId: string, gcmId: string, novoStatus: "PRESENTE" | "AUSENTE") {
  const session = await auth()
  const role = session?.user?.role
  const validadorId = session?.user?.id

  if (!validadorId || (role !== "LIDER" && role !== "SUPERVISOR")) {
    throw new Error("Apenas Líderes ou Supervisores podem validar presença.")
  }

  // Delegação: só quem foi indicado como validador daquele evento específico pode fazer o check-in
  const autorizado = await prisma.evento.findFirst({
    where: { id: eventoId, validadores: { some: { id: validadorId } } },
    select: { id: true }
  })

  if (!autorizado) {
    throw new Error("Você não foi delegado como validador deste evento.")
  }

  await prisma.convocacao.update({
    where: { eventoId_gcmId: { eventoId, gcmId } },
    data: { status: novoStatus, validadoPorId: validadorId, validadoEm: new Date() }
  })

  revalidatePath(`/gcm/checkin/${eventoId}`)
  revalidatePath(`/gcm/checkin`)
  revalidatePath(`/admin/eventos/${eventoId}`)
}
