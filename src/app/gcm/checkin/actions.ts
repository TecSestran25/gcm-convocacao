// src/app/gcm/checkin/actions.ts
"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function registrarCheckin(eventoId: string, gcmId: string, novoStatus: "PRESENTE" | "AUSENTE") {
  const session = await auth()
  const role = session?.user?.role

  if (role !== "LIDER" && role !== "SUPERVISOR") {
    throw new Error("Apenas Líderes ou Supervisores podem validar presença.")
  }

  await prisma.convocacao.update({
    where: { eventoId_gcmId: { eventoId, gcmId } },
    data: { status: novoStatus }
  })

  revalidatePath(`/gcm/checkin/${eventoId}`)
  revalidatePath(`/gcm/checkin`)
  revalidatePath(`/admin/eventos/${eventoId}`)
}
