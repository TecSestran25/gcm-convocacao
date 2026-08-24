// src/app/admin/escalas/page.tsx
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CalendarClock, Shield, Trash2 } from "lucide-react"
import { criarEquipe, excluirEquipe, definirEscalaOrdinaria, excluirEscalaOrdinaria } from "./actions"

export const dynamic = "force-dynamic"

export default async function EscalasPage() {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const [equipes, escalas] = await Promise.all([
    prisma.equipe.findMany({ orderBy: { nome: 'asc' } }),
    prisma.escalaOrdinaria.findMany({
      where: { data: { gte: hoje } },
      orderBy: { data: 'asc' },
      take: 30
    })
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Escala Ordinária</h1>
        <p className="text-slate-500">Cadastre as equipes e quem está de plantão ordinário em cada dia — usado para bloquear convocações da equipe de serviço.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cadastro de Equipes */}
        <Card className="border-slate-200 shadow-sm lg:col-span-1 h-fit">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
              <Shield className="w-5 h-5 text-indigo-600" />
              Equipes
            </CardTitle>
            <CardDescription>Nome e cor de identificação de cada equipe.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <form action={criarEquipe} className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium text-slate-600">Nome</label>
                <Input name="nome" required placeholder="Ex: CHARLIE" className="h-10 uppercase" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">Cor</label>
                <input name="cor" type="color" defaultValue="#3b82f6" className="h-10 w-12 rounded-md border border-input p-1" />
              </div>
              <Button type="submit" className="h-10">Adicionar</Button>
            </form>

            <div className="space-y-2">
              {equipes.length === 0 ? (
                <p className="text-sm text-slate-500">Nenhuma equipe cadastrada ainda.</p>
              ) : (
                equipes.map((equipe) => (
                  <div key={equipe.id} className="flex items-center justify-between gap-2 p-2 rounded-md border border-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full border border-slate-300" style={{ backgroundColor: equipe.cor }} />
                      <span className="font-medium text-slate-800 text-sm">{equipe.nome}</span>
                    </div>
                    <form action={excluirEquipe.bind(null, equipe.id)}>
                      <Button type="submit" size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </form>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Escala Ordinária (calendário dia a dia) */}
        <Card className="border-slate-200 shadow-sm lg:col-span-2">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
              <CalendarClock className="w-5 h-5 text-blue-600" />
              Plantão Ordinário por Dia
            </CardTitle>
            <CardDescription>Quem está de serviço ordinário em cada data (não pode ser convocado nesse dia).</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <form action={definirEscalaOrdinaria} className="flex flex-col sm:flex-row items-end gap-2">
              <div className="flex-1 w-full space-y-1">
                <label className="text-xs font-medium text-slate-600">Data</label>
                <Input name="data" type="date" required className="h-10" />
              </div>
              <div className="flex-1 w-full space-y-1">
                <label className="text-xs font-medium text-slate-600">Equipe de plantão</label>
                <select name="equipe" required className="h-10 w-full rounded-md border border-input bg-white px-3 text-sm">
                  <option value="">Selecione...</option>
                  {equipes.map((equipe) => (
                    <option key={equipe.id} value={equipe.nome}>{equipe.nome}</option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="h-10 w-full sm:w-auto">Salvar</Button>
            </form>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-md">
              {escalas.length === 0 ? (
                <p className="text-sm text-slate-500 p-4">Nenhum plantão ordinário cadastrado a partir de hoje.</p>
              ) : (
                escalas.map((escala) => {
                  const equipeInfo = equipes.find(e => e.nome === escala.equipe)
                  return (
                    <div key={escala.id} className="flex items-center justify-between gap-2 p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-slate-700 w-28">
                          {escala.data.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-800">
                          <span className="w-3 h-3 rounded-full border border-slate-300" style={{ backgroundColor: equipeInfo?.cor ?? "#94a3b8" }} />
                          {escala.equipe}
                        </span>
                      </div>
                      <form action={excluirEscalaOrdinaria.bind(null, escala.id)}>
                        <Button type="submit" size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </form>
                    </div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
