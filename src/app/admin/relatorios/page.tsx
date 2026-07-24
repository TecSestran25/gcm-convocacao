/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/admin/relatorios/page.tsx
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart3, CheckCircle2, XCircle, AlertTriangle, Users, Clock, Shield } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function RelatoriosPage() {
  // Busca todos os usuários, incluindo o histórico de convocações deles
  // Removemos o filtro de 'role: "GCM"' estrito para pegar Lideres, Comandos, etc, caso eles tenham equipe
  const gcms = await prisma.usuario.findMany({
    where: { 
      role: { not: "ADMIN" }, // Não exibe admins no relatório
      equipe: { not: null }   // Só considera quem tem equipe definida
    },
    include: {
      convocacoes: true
    },
    orderBy: { nome: 'asc' }
  })
  
  // 1. Processa os dados de cada GCM primeiro (Individual)
  const relatorio = gcms.map(gcm => {
    const totalMissoes = gcm.convocacoes.length
    const confirmados = gcm.convocacoes.filter(c => c.status === "CONFIRMADO").length
    const faltas = gcm.convocacoes.filter(c => c.status === ("FALTOU" as typeof c.status)).length
    const recusados = gcm.convocacoes.filter(c => c.status === "RECUSADO").length
    const pendentes = gcm.convocacoes.filter(c => c.status === "PENDENTE" || c.status === "ACEITO").length
    
    // Estimativa de 12 horas por plantão confirmado
    const horasTrabalhadas = confirmados * 12

    return { ...gcm, totalMissoes, confirmados, faltas, recusados, pendentes, horasTrabalhadas }
  })

  // 2. Agrupa os dados por Equipe
  const relatorioEquipesMap = new Map<string, any>()

  relatorio.forEach(gcm => {
    const nomeEquipe = gcm.equipe || "SEM EQUIPE"
    
    if (!relatorioEquipesMap.has(nomeEquipe)) {
      relatorioEquipesMap.set(nomeEquipe, {
        equipe: nomeEquipe,
        totalGcms: 0,
        totalServicos: 0,
        horasTotais: 0,
        recusasTotais: 0
      })
    }

    const equipeStats = relatorioEquipesMap.get(nomeEquipe)
    equipeStats.totalGcms += 1
    equipeStats.totalServicos += gcm.confirmados
    equipeStats.horasTotais += gcm.horasTrabalhadas
    equipeStats.recusasTotais += gcm.recusados
  })

  // Converte o Map de volta para um Array e calcula o Índice de Participação
  const relatorioEquipes = Array.from(relatorioEquipesMap.values()).map(eq => {
    const totalConvocaçõesNaEquipe = eq.totalServicos + eq.recusasTotais
    // Evita divisão por zero
    const indiceParticipacao = totalConvocaçõesNaEquipe > 0 
      ? Math.round((eq.totalServicos / totalConvocaçõesNaEquipe) * 100) 
      : 0
      
    return { ...eq, indiceParticipacao }
  }).sort((a, b) => a.equipe.localeCompare(b.equipe)) // Ordem alfabética


  // Totais Gerais
  const totalConfirmadosGeral = relatorio.reduce((acc, gcm) => acc + gcm.confirmados, 0)
  const totalRecusasGeral = relatorio.reduce((acc, gcm) => acc + gcm.recusados, 0)
  const totalFaltasGeral = relatorio.reduce((acc, gcm) => acc + gcm.faltas, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Relatórios Operacionais</h1>
        <p className="text-slate-500">Histórico de produtividade e engajamento do efetivo.</p>
      </div>

      {/* ========================================== */}
      {/* PLACAR GERAL (Métricas do Comando)         */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-lg"><Users className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Efetivo GCM</p>
              <h3 className="text-2xl font-bold text-slate-900">{gcms.length}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 text-green-700 rounded-lg"><CheckCircle2 className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Plantões Realizados</p>
              <h3 className="text-2xl font-bold text-slate-900">{totalConfirmadosGeral}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-orange-100 text-orange-700 rounded-lg"><AlertTriangle className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total de Recusas</p>
              <h3 className="text-2xl font-bold text-slate-900">{totalRecusasGeral}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-red-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-700 rounded-lg"><XCircle className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Faltas Registradas</p>
              <h3 className="text-2xl font-bold text-red-600">{totalFaltasGeral}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ========================================== */}
        {/* TABELA POR EQUIPES (ITEM 12 DO ESCOPO)     */}
        {/* ========================================== */}
        <Card className="border-slate-200 shadow-sm lg:col-span-1 h-fit">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
              <Shield className="w-5 h-5 text-indigo-600" />
              Desempenho por Equipes
            </CardTitle>
            <CardDescription>Carga operacional de cada equipe.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100/50 text-slate-600 uppercase text-[10px] font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Equipe</th>
                    <th className="px-2 py-3 text-center">GCMs</th>
                    <th className="px-2 py-3 text-center">Serviços</th>
                    <th className="px-2 py-3 text-center">Horas</th>
                    <th className="px-4 py-3 text-right">Índice Part.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {relatorioEquipes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500">Nenhuma equipe com dados.</td>
                    </tr>
                  ) : (
                    relatorioEquipes.map((eq) => (
                      <tr key={eq.equipe} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-800">{eq.equipe}</td>
                        <td className="px-2 py-3 text-center text-slate-600">{eq.totalGcms}</td>
                        <td className="px-2 py-3 text-center font-medium text-slate-900">{eq.totalServicos}</td>
                        <td className="px-2 py-3 text-center text-slate-600">{eq.horasTotais}h</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-flex items-center justify-center px-2 py-1 rounded font-bold text-xs ${
                            eq.indiceParticipacao >= 70 ? "bg-green-100 text-green-700" :
                            eq.indiceParticipacao >= 40 ? "bg-orange-100 text-orange-700" : 
                            "bg-red-100 text-red-700"
                          }`}>
                            {eq.indiceParticipacao}%
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ========================================== */}
        {/* TABELA INDIVIDUAL                          */}
        {/* ========================================== */}
        <Card className="border-slate-200 shadow-sm lg:col-span-2">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Produtividade Individual
            </CardTitle>
            <CardDescription>Resumo de serviços extraordinários por Guarda.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100/50 text-slate-600 uppercase text-xs font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">GCM / Matrícula</th>
                    <th className="px-4 py-3">Equipe</th>
                    <th className="px-4 py-3 text-center">Presenças</th>
                    <th className="px-4 py-3 text-center">Horas Est.</th>
                    <th className="px-4 py-3 text-center">Recusas</th>
                    <th className="px-4 py-3 text-center">Faltas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {relatorio.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                        Nenhum dado operacional registrado.
                      </td>
                    </tr>
                  ) : (
                    relatorio.map((gcm) => (
                      <tr key={gcm.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">{gcm.nome}</p>
                          <p className="text-xs text-slate-500">Mat: {gcm.matricula}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="bg-slate-200 text-slate-800 text-xs px-2 py-1 rounded font-medium">
                            {gcm.equipe || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 font-semibold text-green-600">
                            {gcm.confirmados > 0 && <CheckCircle2 className="w-4 h-4" />}
                            {gcm.confirmados}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-slate-700 flex items-center justify-center gap-1">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {gcm.horasTrabalhadas}h
                        </td>
                        <td className="px-4 py-3 text-center text-slate-600">
                          {gcm.recusados}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {gcm.faltas > 0 ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-red-600">
                              <XCircle className="w-4 h-4" /> {gcm.faltas}
                            </span>
                          ) : (
                            <span className="text-slate-400">0</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}