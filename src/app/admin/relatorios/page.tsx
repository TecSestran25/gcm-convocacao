/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/admin/relatorios/page.tsx
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart3, CheckCircle2, XCircle, AlertTriangle, Users, Shield, ShieldAlert } from "lucide-react"
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
    // Só conta como "Plantão Realizado" quem teve a presença validada pelo Líder/Supervisor (Regra 6).
    // Atrasado ainda cumpriu o plantão (com ressalva); Atestado/Troca não contam como trabalhado.
    const confirmados = gcm.convocacoes.filter(c => c.status === "PRESENTE" || c.status === "ATRASADO").length
    const faltas = gcm.convocacoes.filter(c => c.status === "AUSENTE").length
    const recusados = gcm.convocacoes.filter(c => c.status === "RECUSADO").length
    const pendentes = gcm.convocacoes.filter(c => c.status === "PENDENTE" || c.status === "ACEITO" || c.status === "CONFIRMADO").length
    // Ocorrências a destacar (inclui quem trabalhou atrasado)
    const imprevistos = gcm.convocacoes.filter(c => ["ATRASADO", "ATESTADO", "TROCA"].includes(c.status)).length
    // Foi escalado mas não prestou o serviço (para o índice de participação abaixo) — exclui atrasado, que trabalhou
    const naoCompareceu = gcm.convocacoes.filter(c => ["AUSENTE", "ATESTADO", "TROCA"].includes(c.status)).length

    // Estimativa de 12 horas por plantão com presença validada
    const horasTrabalhadas = confirmados * 12

    return { ...gcm, totalMissoes, confirmados, faltas, recusados, pendentes, imprevistos, naoCompareceu, horasTrabalhadas }
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
        recusasTotais: 0,
        faltasTotais: 0,
        imprevistosTotais: 0,
        naoCompareceuTotais: 0,
        pendentesTotais: 0
      })
    }

    const equipeStats = relatorioEquipesMap.get(nomeEquipe)
    equipeStats.totalGcms += 1
    equipeStats.totalServicos += gcm.confirmados
    equipeStats.horasTotais += gcm.horasTrabalhadas
    equipeStats.recusasTotais += gcm.recusados
    equipeStats.faltasTotais += gcm.faltas
    equipeStats.imprevistosTotais += gcm.imprevistos
    equipeStats.naoCompareceuTotais += gcm.naoCompareceu
    equipeStats.pendentesTotais += gcm.pendentes
  })

  // Converte o Map de volta para um Array e calcula o Índice de Participação:
  // de tudo que já foi decidido (trabalhou, recusou, faltou, atestado ou trocado),
  // qual fração efetivamente prestou o serviço. Atrasado conta como "trabalhou".
  const relatorioEquipes = Array.from(relatorioEquipesMap.values()).map(eq => {
    const totalDecididoNaEquipe = eq.totalServicos + eq.recusasTotais + eq.naoCompareceuTotais
    // Evita divisão por zero
    const indiceParticipacao = totalDecididoNaEquipe > 0
      ? Math.round((eq.totalServicos / totalDecididoNaEquipe) * 100)
      : 0

    return { ...eq, indiceParticipacao }
  }).sort((a, b) => a.equipe.localeCompare(b.equipe)) // Ordem alfabética


  // Totais Gerais
  const totalConfirmadosGeral = relatorio.reduce((acc, gcm) => acc + gcm.confirmados, 0)
  const totalRecusasGeral = relatorio.reduce((acc, gcm) => acc + gcm.recusados, 0)
  const totalFaltasGeral = relatorio.reduce((acc, gcm) => acc + gcm.faltas, 0)
  const totalImprevistosGeral = relatorio.reduce((acc, gcm) => acc + gcm.imprevistos, 0)
  // Escalado(s) cujo check-in ainda não foi feito pelo Líder (não conta nem como presença, nem como falta)
  const totalAguardandoCheckinGeral = relatorio.reduce((acc, gcm) => acc + gcm.pendentes, 0)

  return (
    <div className="space-y-6">
      <div className="ml-14 lg:ml-16">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Relatórios Operacionais</h1>
        <p className="text-slate-500">Histórico de produtividade e engajamento do efetivo.</p>
      </div>

      {/* ========================================== */}
      {/* PLACAR GERAL (Métricas do Comando)         */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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

        <Card className="shadow-sm border-purple-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-700 rounded-lg"><ShieldAlert className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Imprevistos</p>
              <h3 className="text-2xl font-bold text-slate-900">{totalImprevistosGeral}</h3>
              <p className="text-[11px] text-slate-400">Atraso, atestado ou troca</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-slate-100 text-slate-600 rounded-lg"><Users className="w-6 h-6" /></div>
            <div>
              <p className="text-sm font-medium text-slate-500">Em Aberto</p>
              <h3 className="text-2xl font-bold text-slate-900">{totalAguardandoCheckinGeral}</h3>
              <p className="text-[11px] text-slate-400">Escalados sem check-in ainda</p>
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