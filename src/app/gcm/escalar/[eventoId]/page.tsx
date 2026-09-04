// src/app/gcm/escalar/[eventoId]/page.tsx
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { EscalarGuardasForm } from "@/components/EscalarGuardasForm"
import { listarGcmsElegiveisParaEscalar } from "@/app/admin/eventos/escalacao-actions"
import { ArrowLeft, CalendarDays, MapPin, ClipboardList } from "lucide-react"

export default async function EscalarEventoPage({ params }: { params: Promise<{ eventoId: string }> }) {
  const session = await auth()
  const role = session?.user?.role
  const userId = session?.user?.id

  if (role !== "LIDER" && role !== "SUPERVISOR") {
    redirect("/gcm/convocacoes")
  }

  const { eventoId } = await params

  const evento = await prisma.evento.findUnique({
    where: { id: eventoId },
    include: {
      convocacoes: { select: { status: true } },
      validadores: { select: { id: true } }
    }
  })

  if (!evento) redirect("/gcm/escalar")

  const estaDelegado = evento.validadores.some(v => v.id === userId)
  if (!estaDelegado) redirect("/gcm/escalar")

  // TROCA reabre a vaga para um substituto, então não conta como ocupada
  const vagasOcupadas = evento.convocacoes.filter(c => c.status !== "TROCA").length
  const vagasRestantes = Math.max(0, evento.vagas - vagasOcupadas)

  const resultadoGcms = await listarGcmsElegiveisParaEscalar(eventoId, evento.equipePrioritaria)

  return (
    <div className="pb-12">
      <div className="bg-slate-900 text-white px-4 py-8 pt-12 shadow-md mb-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-3">
          <Link href="/gcm/escalar" className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-slate-700 p-3 rounded-full">
              <ClipboardList className="w-6 h-6 text-slate-300" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{evento.codigo}</h1>
              <div className="flex flex-wrap items-center gap-3 text-slate-400 text-xs mt-1">
                <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5" /> {evento.dataServico.toLocaleDateString('pt-BR', { timeZone: 'UTC' })} às {evento.horario}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {evento.local}</span>
              </div>
              <p className="text-slate-300 text-sm mt-1">Equipe {evento.equipePrioritaria} · {vagasRestantes} vaga(s) em aberto</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4">
        {vagasRestantes === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center shadow-sm">
            <p className="text-slate-500 font-medium">Todas as vagas desta missão já foram preenchidas.</p>
          </div>
        ) : resultadoGcms.erro ? (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl p-4">
            {resultadoGcms.erro}
          </div>
        ) : (
          <EscalarGuardasForm
            eventoId={evento.id}
            vagasRestantes={vagasRestantes}
            gcms={resultadoGcms.gcms ?? []}
          />
        )}
      </div>
    </div>
  )
}
