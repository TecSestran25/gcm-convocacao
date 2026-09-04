// src/lib/escala-ordinaria.ts
import { prisma } from "@/lib/prisma"
import { StatusConvocacao } from "@prisma/client"

// Status que ocupam uma vaga da escala (qualquer estágio pós-seleção pelo Líder).
// TROCA fica de fora de propósito: uma troca de última hora reabre a vaga para um substituto.
export const STATUS_OCUPA_VAGA: StatusConvocacao[] = [
  StatusConvocacao.CONFIRMADO,
  StatusConvocacao.PRESENTE,
  StatusConvocacao.AUSENTE,
  StatusConvocacao.ATRASADO,
  StatusConvocacao.ATESTADO,
]

// Busca qual equipe está de plantão ordinário no dia do evento (Regra 1 - Bloqueio)
export async function buscarEquipeOrdinaria(data: Date): Promise<string | null> {
  const inicioDia = new Date(data)
  inicioDia.setUTCHours(0, 0, 0, 0)
  const fimDia = new Date(inicioDia)
  fimDia.setUTCDate(fimDia.getUTCDate() + 1)

  const escala = await prisma.escalaOrdinaria.findFirst({
    where: { data: { gte: inicioDia, lt: fimDia } }
  })

  return escala?.equipe ?? null
}
