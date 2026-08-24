// src/lib/dados-formulario-evento.ts
import { prisma } from "@/lib/prisma"

export async function buscarDadosFormularioEvento() {
  const [equipesCadastradas, equipesDeUsuarios, lideres] = await Promise.all([
    prisma.equipe.findMany({ select: { nome: true }, orderBy: { nome: 'asc' } }),
    prisma.usuario.findMany({
      where: { role: { not: "ADMIN" }, equipe: { not: null } },
      select: { equipe: true },
      distinct: ['equipe']
    }),
    prisma.usuario.findMany({
      where: { role: { in: ["LIDER", "SUPERVISOR"] } },
      select: { id: true, nome: true, matricula: true },
      orderBy: { nome: 'asc' }
    })
  ])

  const equipes = Array.from(new Set([
    ...equipesCadastradas.map(e => e.nome),
    ...equipesDeUsuarios.map(e => e.equipe as string)
  ])).sort()

  return { equipes, lideres }
}
