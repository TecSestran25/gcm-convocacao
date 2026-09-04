// src/app/admin/eventos/[id]/relatorio/page.tsx
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText, Users, CheckCircle2, XCircle, HelpCircle, ThumbsUp, AlertTriangle } from "lucide-react"

const ROTULOS_STATUS: Record<string, string> = {
  PENDENTE: "Não respondeu (aguardando)",
  ACEITO: "Aceitou",
  RECUSADO: "Recusou",
  CONFIRMADO: "Escalado (aguardando check-in)",
  PRESENTE: "Presença Confirmada",
  AUSENTE: "Faltou",
  ATRASADO: "Atrasou",
  ATESTADO: "Atestado Médico",
  TROCA: "Troca de Última Hora",
  EXPIRADO: "Não respondeu (prazo expirado)",
}

export default async function RelatorioEventoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const evento = await prisma.evento.findUnique({
    where: { id },
    include: {
      convocacoes: {
        include: { gcm: true, validadoPor: true },
        orderBy: { gcm: { nome: 'asc' } }
      }
    }
  })

  if (!evento) redirect("/admin/eventos")

  const convocados = evento.convocacoes
  const recusaram = convocados.filter(c => c.status === "RECUSADO")
  const naoResponderam = convocados.filter(c => c.status === "PENDENTE" || c.status === "EXPIRADO")
  const aceitaram = convocados.filter(c => ["ACEITO", "CONFIRMADO", "PRESENTE", "AUSENTE", "ATRASADO", "ATESTADO", "TROCA"].includes(c.status))
  const presencaConfirmada = convocados.filter(c => c.status === "PRESENTE" || c.status === "ATRASADO")
  const faltas = convocados.filter(c => c.status === "AUSENTE")
  const imprevistos = convocados.filter(c => ["ATRASADO", "ATESTADO", "TROCA"].includes(c.status))

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <Link href={`/admin/eventos/${id}`} className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Voltar para o evento
        </Link>

        <div className="flex items-center gap-3">
          <div className="bg-slate-900 p-2.5 rounded-xl">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Relatório Detalhado — {evento.codigo}</h1>
            <p className="text-sm text-slate-500">{evento.local} · {evento.dataServico.toLocaleDateString('pt-BR', { timeZone: 'UTC' })} às {evento.horario}</p>
          </div>
        </div>
      </div>

      {/* Placar resumido */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center gap-1">
          <Users className="w-5 h-5 text-slate-500" />
          <span className="text-2xl font-bold text-slate-900">{convocados.length}</span>
          <span className="text-xs font-medium text-slate-500">Convocados</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center gap-1">
          <ThumbsUp className="w-5 h-5 text-emerald-600" />
          <span className="text-2xl font-bold text-slate-900">{aceitaram.length}</span>
          <span className="text-xs font-medium text-slate-500">Escalados</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center gap-1">
          <XCircle className="w-5 h-5 text-red-500" />
          <span className="text-2xl font-bold text-slate-900">{recusaram.length}</span>
          <span className="text-xs font-medium text-slate-500">Recusaram</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center gap-1">
          <HelpCircle className="w-5 h-5 text-amber-500" />
          <span className="text-2xl font-bold text-slate-900">{naoResponderam.length}</span>
          <span className="text-xs font-medium text-slate-500">Não Responderam</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center gap-1">
          <CheckCircle2 className="w-5 h-5 text-blue-600" />
          <span className="text-2xl font-bold text-slate-900">{presencaConfirmada.length}</span>
          <span className="text-xs font-medium text-slate-500">Compareceram</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center gap-1">
          <AlertTriangle className="w-5 h-5 text-purple-500" />
          <span className="text-2xl font-bold text-slate-900">{imprevistos.length}</span>
          <span className="text-xs font-medium text-slate-500">Imprevistos</span>
        </div>
      </div>

      {faltas.length > 0 && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl p-4">
          {faltas.length} guarda(s) marcado(s) como falta neste evento.
        </div>
      )}

      {/* Tabela detalhada */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden overflow-x-auto">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-bold text-slate-800 text-lg">Detalhamento por Guarda</h2>
        </div>
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-bold text-slate-700">Matrícula</TableHead>
              <TableHead className="font-bold text-slate-700">Nome</TableHead>
              <TableHead className="font-bold text-slate-700">Equipe</TableHead>
              <TableHead className="font-bold text-slate-700">Status</TableHead>
              <TableHead className="font-bold text-slate-700">Observação</TableHead>
              <TableHead className="font-bold text-slate-700">Validado por</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {convocados.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-500 py-12">
                  Nenhuma convocação registrada para este evento.
                </TableCell>
              </TableRow>
            )}
            {convocados.map((c) => (
              <TableRow key={c.gcmId}>
                <TableCell className="font-medium text-slate-600">{c.gcm.matricula}</TableCell>
                <TableCell className="font-bold text-slate-900">{c.gcm.nome}</TableCell>
                <TableCell className="text-slate-600">{c.gcm.equipe || "-"}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    c.status === "PRESENTE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                    c.status === "AUSENTE" ? "bg-red-50 text-red-700 border-red-200" :
                    c.status === "RECUSADO" ? "bg-red-50 text-red-700 border-red-200" :
                    c.status === "CONFIRMADO" ? "bg-blue-50 text-blue-700 border-blue-200" :
                    c.status === "ACEITO" ? "bg-slate-100 text-slate-700 border-slate-200" :
                    c.status === "ATRASADO" ? "bg-amber-50 text-amber-700 border-amber-200" :
                    c.status === "ATESTADO" ? "bg-slate-200 text-slate-700 border-slate-300" :
                    c.status === "TROCA" ? "bg-purple-50 text-purple-700 border-purple-200" :
                    "bg-amber-50 text-amber-700 border-amber-200"
                  }>
                    {ROTULOS_STATUS[c.status] ?? c.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-slate-500 text-sm max-w-xs">
                  {c.observacaoIncidente || "-"}
                </TableCell>
                <TableCell className="text-slate-500 text-sm">
                  {c.validadoPor ? (
                    <span>{c.validadoPor.nome}<br /><span className="text-xs text-slate-400">{c.validadoEm?.toLocaleString('pt-BR', { timeZone: 'UTC' })}</span></span>
                  ) : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
