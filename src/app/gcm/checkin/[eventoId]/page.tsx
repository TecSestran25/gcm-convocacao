// src/app/gcm/checkin/[eventoId]/page.tsx
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { BotaoCheckin } from "@/components/BotaoCheckin"
import { ArrowLeft, CalendarDays, MapPin, ClipboardCheck } from "lucide-react"

export default async function CheckinEventoPage({ params }: { params: Promise<{ eventoId: string }> }) {
  const session = await auth()
  const role = session?.user?.role

  if (role !== "LIDER" && role !== "SUPERVISOR") {
    redirect("/gcm/convocacoes")
  }

  const { eventoId } = await params

  const evento = await prisma.evento.findUnique({
    where: { id: eventoId },
    include: {
      convocacoes: {
        where: { status: { in: ["CONFIRMADO", "PRESENTE", "AUSENTE"] } },
        include: { gcm: true },
        orderBy: { gcm: { nome: 'asc' } }
      },
      validadores: { select: { id: true } }
    }
  })

  if (!evento) redirect("/gcm/checkin")

  const estaDelegado = evento.validadores.some(v => v.id === session?.user?.id)
  if (!estaDelegado) redirect("/gcm/checkin")

  return (
    <div className="pb-12">
      <div className="bg-slate-900 text-white px-4 py-8 pt-12 shadow-md mb-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          <Link href="/gcm/checkin" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-slate-700 p-3 rounded-full">
              <ClipboardCheck className="w-6 h-6 text-slate-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{evento.codigo}</h1>
              <div className="flex flex-wrap items-center gap-3 text-slate-400 text-xs mt-1">
                <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> {evento.dataServico.toLocaleDateString('pt-BR', { timeZone: 'UTC' })} às {evento.horario}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {evento.local}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h2 className="font-bold text-slate-800">Efetivo Homologado ({evento.convocacoes.length})</h2>
          </div>

          {evento.convocacoes.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              Nenhum guarda homologado para esta missão ainda.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {evento.convocacoes.map((convocacao) => (
                <div key={convocacao.gcmId} className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{convocacao.gcm.nome}</p>
                    <p className="text-xs text-slate-500">Matrícula: {convocacao.gcm.matricula}</p>
                  </div>
                  <BotaoCheckin
                    eventoId={evento.id}
                    gcmId={convocacao.gcmId}
                    statusAtual={convocacao.status}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
