/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/admin/relatorios/page.tsx
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart3, CheckCircle2, XCircle, AlertTriangle, Users, Shield } from "lucide-react"
import { TabelaProdutividade } from "@/components/TabelaProdutividade"
import { TabelaEquipes } from "@/components/TabelaEquipes"

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
      <div className="ml-14 lg:ml-16">
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
        <Card className="border-slate-200 shadow-sm lg:col-span-1 h-fit flex flex-col">
          <CardHeader className="bg-slate-50 border-b border-slate-200 shrink-0">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
              <Shield className="w-5 h-5 text-indigo-600" />
              Desempenho por Equipes
            </CardTitle>
            <CardDescription>Carga operacional de cada equipe.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            {/* O novo componente entra aqui! */}
            <TabelaEquipes relatorioEquipes={relatorioEquipes} />
          </CardContent>
        </Card>

        {/* ========================================== */}
        {/* TABELA INDIVIDUAL                          */}
        {/* ========================================== */}
        <Card className="border-slate-200 shadow-sm lg:col-span-2 flex flex-col">
          <CardHeader className="bg-slate-50 border-b border-slate-200 shrink-0">
            <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Produtividade Individual
            </CardTitle>
            <CardDescription>Resumo de serviços extraordinários por Guarda.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            {/* Aqui entra nosso novo componente que faz a mágica! */}
            <TabelaProdutividade relatorio={relatorio} />
          </CardContent>
        </Card>

      </div>
    </div>
  )
}