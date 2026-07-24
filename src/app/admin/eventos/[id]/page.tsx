/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/admin/eventos/[id]/page.tsx
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { homologarGuarda, removerHomologacao } from "../actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BotaoImprimir } from "@/components/BotaoImprimir"
import { BotaoPresenca } from "@/components/BotaoPresenca"
import { BotaoAutomacao } from "@/components/BotaoAutomacao"

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

  // Filtra apenas os guardas confirmados para a folha de impressão
  const listaOficial = evento.convocacoes.filter(c => c.status === "CONFIRMADO")

  return (
    <div className="max-w-5xl mx-auto">
      
      {/* ========================================== */}
      {/* VISÃO DA TELA (Escondida na impressão)     */}
      {/* ========================================== */}
      <div className="space-y-8 print:hidden">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Convocação: {evento.codigo}
            </h1>
            <p className="text-slate-500 mt-1">
              {evento.local} • {evento.dataServico.toLocaleDateString('pt-BR', { timeZone: 'UTC' })} • {evento.horario}
            </p>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <BotaoImprimir />
            <div>
              <p className="text-sm text-slate-500 mb-1">Vagas Preenchidas</p>
              <p className="text-2xl font-bold text-slate-900">
                <span className={limiteAtingido ? "text-red-600" : "text-blue-600"}>{confirmados}</span>
                <span className="text-slate-400 text-lg"> / {evento.vagas}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="print:hidden">
          <BotaoAutomacao 
            eventoId={resolvedParams.id} 
            equipeAlvo={evento.equipePrioritaria}
            vagasDisponiveis={vagasRestantes}
          />
        </div>
        <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Matrícula</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ação do Comando</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evento.convocacoes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-slate-500 py-6">Nenhuma resposta recebida.</TableCell>
                </TableRow>
              )}
              {evento.convocacoes.map((convocacao) => (
                <TableRow key={convocacao.gcmId}>
                  <TableCell className="font-medium">{convocacao.gcm.matricula}</TableCell>
                  <TableCell>{convocacao.gcm.nome}</TableCell>
                  <TableCell>
                    <Badge variant={
                      convocacao.status === "CONFIRMADO" ? "default" :
                      convocacao.status === "ACEITO" ? "outline" : "secondary"
                    } className={convocacao.status === "CONFIRMADO" ? "bg-blue-600 text-white" : ""}>
                      {convocacao.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <BotaoPresenca 
                      eventoId={resolvedParams.id} 
                      gcmId={convocacao.gcmId} 
                      statusAtual={convocacao.status} 
                    />
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