// src/app/gcm/historico/page.tsx
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { Clock, CalendarDays, MapPin } from "lucide-react"

const ROTULOS_STATUS: Record<string, string> = {
  CONFIRMADO: "Escalado",
  PRESENTE: "Presença Confirmada",
  AUSENTE: "Faltou",
  ATRASADO: "Atrasou",
  ATESTADO: "Atestado Médico",
  TROCA: "Substituído",
}

const CORES_STATUS: Record<string, string> = {
  CONFIRMADO: "bg-blue-200 text-blue-800",
  PRESENTE: "bg-emerald-200 text-emerald-800",
  AUSENTE: "bg-red-200 text-red-800",
  ATRASADO: "bg-amber-200 text-amber-800",
  ATESTADO: "bg-slate-300 text-slate-800",
  TROCA: "bg-purple-200 text-purple-800",
}

export default async function HistoricoGcmPage() {
  const session = await auth()
  const gcmId = session?.user?.id

  if (!gcmId) return null

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  // Busca as respostas dele apenas para eventos passados
  const historico = await prisma.convocacao.findMany({
    where: {
      gcmId,
      evento: { dataServico: { lt: hoje } }
    },
    include: { evento: true },
    orderBy: { evento: { dataServico: 'desc' } }
  })

  return (
    <div className="pb-12">
      {/* Cabeçalho */}
      <div className="bg-slate-900 text-white px-4 py-8 pt-12 shadow-md mb-6">
        {/* Mudamos para flex-col e centralizamos tudo */}
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center gap-3 text-center">
          <div className="bg-slate-700 p-4 rounded-full mb-1">
            <Clock className="w-8 h-8 text-slate-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Meu Histórico</h1>
            <p className="text-slate-400 text-sm">Escalas passadas</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-4">
        {historico.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center shadow-sm">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Nenhum histórico encontrado.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {historico.map((resposta) => {
              const evento = resposta.evento
              const status = resposta.status

              return (
                <div key={evento.id} className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm opacity-95">
                  <div className="px-4 py-2 flex justify-between items-center text-xs font-bold bg-slate-100 border-b border-slate-200 text-slate-600">
                    <span>{evento.codigo}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
                      CORES_STATUS[status] ?? "bg-red-200 text-red-800"
                    }`}>
                      {ROTULOS_STATUS[status] ?? status}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <p className="text-slate-700 font-medium text-sm leading-tight">{evento.local}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-slate-500 text-xs pl-7">
                      <CalendarDays className="w-3.5 h-3.5" />
                      <span>{evento.dataServico.toLocaleDateString('pt-BR', { timeZone: 'UTC' })} às {evento.horario}</span>
                    </div>

                    {resposta.observacaoIncidente && (
                      <p className="text-xs text-slate-500 italic pl-7">&quot;{resposta.observacaoIncidente}&quot;</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}