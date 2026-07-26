// src/app/admin/eventos/[id]/page.tsx
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BotaoImprimir } from "@/components/BotaoImprimir"
import { BotaoPresenca } from "@/components/BotaoPresenca"
import { BotaoAutomacao } from "@/components/BotaoAutomacao"
import { AutoRefresh } from "@/components/AutoRefresh"
import Link from "next/link"

// Ícones para dar um visual Premium
import { ArrowLeft, ShieldAlert, MapPin, CalendarDays, Users, Zap } from "lucide-react"

export default async function DetalhesEventoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  
  const evento = await prisma.evento.findUnique({
    where: { id: resolvedParams.id },
    include: {
      convocacoes: {
        include: { gcm: true },
        orderBy: { dataResposta: 'asc' }
      }
    }
  })

  if (!evento) redirect("/admin/eventos")

  const confirmados = evento.convocacoes.filter(c => c.status === "CONFIRMADO").length
  const limiteAtingido = confirmados >= evento.vagas
  const vagasRestantes = Math.max(0, evento.vagas - confirmados)
  const porcentagemVagas = Math.min((confirmados / evento.vagas) * 100, 100)

  // Filtra apenas os guardas confirmados para a folha de impressão
  const listaOficial = evento.convocacoes.filter(c => c.status === "CONFIRMADO")

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* O Motor invisível rodando a cada 10 segundos */}
      <AutoRefresh interval={10000} />
      
      {/* ========================================== */}
      {/* VISÃO DA TELA (Escondida na impressão)     */}
      {/* ========================================== */}
      <div className="space-y-6 print:hidden pb-12">
        
        {/* 1. CABEÇALHO DO EVENTO */}
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200">
          <Link href="/admin/eventos" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            Voltar para Eventos
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-slate-900 p-2.5 rounded-xl">
                  <ShieldAlert className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                  {evento.codigo}
                </h1>
              </div>
              
              {/* Badges de Informação Rápidas */}
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <span className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-md">
                  <MapPin className="w-4 h-4 text-slate-400" /> {evento.local}
                </span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-md">
                  <CalendarDays className="w-4 h-4 text-slate-400" /> {evento.dataServico.toLocaleDateString('pt-BR', { timeZone: 'UTC' })} às {evento.horario}
                </span>
                <span className="flex items-center gap-1.5 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-md">
                  <Users className="w-4 h-4 text-slate-400" /> Equipe: <strong className="text-slate-800">{evento.equipePrioritaria}</strong>
                </span>
              </div>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              <BotaoImprimir />
            </div>
          </div>
        </div>

        {/* 2. GRID DE WIDGETS (Vagas e Automação) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Widget 1: Vagas */}
          <div className="col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center">
            <div className="flex justify-between items-end mb-2">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Preenchimento</p>
              <p className="text-3xl font-black text-slate-800">
                <span className={limiteAtingido ? "text-amber-500" : "text-blue-600"}>{confirmados}</span>
                <span className="text-slate-300 text-xl">/{evento.vagas}</span>
              </p>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden shadow-inner">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${limiteAtingido ? 'bg-amber-500' : 'bg-blue-600'}`} 
                style={{ width: `${porcentagemVagas}%` }}
              ></div>
            </div>
            {limiteAtingido && (
              <p className="text-xs font-bold text-amber-600 mt-3 text-center bg-amber-50 py-1 rounded">Lotação Máxima Atingida</p>
            )}
          </div>

          {/* Widget 2: Sistema de Fila Automática */}
          <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl shadow-sm border border-blue-100 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 overflow-hidden">
            <div className="flex-1 w-full">
              <h3 className="font-bold text-blue-900 flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-blue-600 fill-blue-600" /> 
                Acionamento Automático
              </h3>
              <p className="text-sm text-blue-700">
                Precisa de mais guardas? Utilize a automação para convocar os próximos disponíveis da fila (Equipe {evento.equipePrioritaria}) enviando notificações imediatas.
              </p>
            </div>
            
            <div className="w-full xl:w-auto bg-white p-2 rounded-xl shadow-sm border border-blue-100 shrink-0 overflow-x-auto">
              <BotaoAutomacao 
                eventoId={resolvedParams.id} 
                equipeAlvo={evento.equipePrioritaria}
                vagasDisponiveis={vagasRestantes}
              />
            </div>
          </div>

        </div>

        {/* 3. TABELA DE RESPOSTAS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-lg">Respostas do Efetivo ({evento.convocacoes.length})</h2>
          </div>
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-bold text-slate-700 w-[120px]">Matrícula</TableHead>
                <TableHead className="font-bold text-slate-700">Nome</TableHead>
                <TableHead className="font-bold text-slate-700 w-[160px]">Status</TableHead>
                <TableHead className="text-right font-bold text-slate-700 w-[250px]">Ação do Comando</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evento.convocacoes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-500 py-12">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="w-8 h-8 text-slate-300" />
                      <p>Nenhuma resposta recebida até o momento.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {evento.convocacoes.map((convocacao) => (
                <TableRow key={convocacao.gcmId} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-medium text-slate-600">{convocacao.gcm.matricula}</TableCell>
                  <TableCell className="font-bold text-slate-900">{convocacao.gcm.nome}</TableCell>
                  <TableCell>
                    <Badge variant={
                      convocacao.status === "CONFIRMADO" ? "default" :
                      convocacao.status === "ACEITO" ? "outline" : 
                      "destructive"
                    } className={
                      convocacao.status === "CONFIRMADO" ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm" : 
                      convocacao.status === "ACEITO" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : 
                      "bg-red-50 text-red-700 hover:bg-red-50 border-transparent shadow-none"
                    }>
                      {convocacao.status === "CONFIRMADO" ? "HOMOLOGADO" : convocacao.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end w-full">
                      <BotaoPresenca 
                        eventoId={resolvedParams.id} 
                        gcmId={convocacao.gcmId} 
                        statusAtual={convocacao.status} 
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ========================================== */}
      {/* VISÃO DE IMPRESSÃO (Visível apenas no PDF) */}
      {/* ========================================== */}
      <div className="hidden print:block print:bg-white print:text-black">
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-wider">Guarda Civil Municipal de Goiana</h1>
          <h2 className="text-xl font-semibold mt-2">ESCALA OPERACIONAL OFICIAL</h2>
        </div>

        <div className="mb-6 space-y-2 text-lg">
          <p><strong>CÓDIGO DA MISSÃO:</strong> {evento.codigo}</p>
          <p><strong>LOCAL/MISSÃO:</strong> {evento.local}</p>
          <p><strong>DATA:</strong> {evento.dataServico.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
          <p><strong>HORÁRIO:</strong> {evento.horario}</p>
          <p><strong>EFETIVO SOLICITADO:</strong> {evento.vagas} GCMs</p>
        </div>

        <h3 className="text-lg font-bold mb-3 uppercase bg-gray-200 p-2">Efetivo Confirmado</h3>
        
        <table className="w-full border-collapse border border-black text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-2 w-32">Matrícula</th>
              <th className="border border-black p-2">Nome Completo</th>
              <th className="border border-black p-2 w-32">Equipe</th>
              <th className="border border-black p-2 w-48">Assinatura</th>
            </tr>
          </thead>
          <tbody>
            {listaOficial.length === 0 ? (
              <tr>
                <td colSpan={4} className="border border-black p-4 text-center">Nenhum GCM confirmado para esta escala.</td>
              </tr>
            ) : (
              listaOficial.map((c) => (
                <tr key={c.gcmId}>
                  <td className="border border-black p-2 font-bold">{c.gcm.matricula}</td>
                  <td className="border border-black p-2 uppercase">{c.gcm.nome}</td>
                  <td className="border border-black p-2 uppercase">{c.gcm.equipe || "-"}</td>
                  <td className="border border-black p-2"></td> 
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="mt-16 pt-8 text-center w-64 mx-auto">
          <div className="border-t border-black mb-2"></div>
          <p className="font-bold">Comando da GCM</p>
          <p className="text-sm">Visto / Autorização</p>
        </div>
      </div>

    </div>
  )
}