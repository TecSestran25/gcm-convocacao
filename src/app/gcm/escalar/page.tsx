// src/app/gcm/escalar/page.tsx
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ClipboardList, CalendarDays, MapPin, ChevronRight } from "lucide-react"

export default async function EscalarListaPage() {
  const session = await auth()
  const role = session?.user?.role
  const userId = session?.user?.id

  if (role !== "LIDER" && role !== "SUPERVISOR") {
    redirect("/gcm/convocacoes")
  }

  const eventos = await prisma.evento.findMany({
    where: {
      validadores: { some: { id: userId } }
    },
    include: {
      convocacoes: { select: { status: true } }
    },
    orderBy: { dataServico: 'desc' }
  })

  // TROCA reabre a vaga para um substituto, então não conta como ocupada
  const vagasOcupadas = (convocacoes: { status: string }[]) => convocacoes.filter(c => c.status !== "TROCA").length
  const eventosComVaga = eventos.filter(e => vagasOcupadas(e.convocacoes) < e.vagas)

  return (
    <div className="pb-12">
      <div className="bg-slate-900 text-white px-4 py-8 pt-12 shadow-md mb-6">
        <div className="max-w-3xl mx-auto flex flex-col items-center justify-center gap-3 text-center">
          <div className="bg-slate-700 p-4 rounded-full mb-1">
            <ClipboardList className="w-8 h-8 text-slate-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Escalar Guardas</h1>
            <p className="text-slate-400 text-sm">Preencha as vagas das missões sob sua responsabilidade</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-3">
        {eventosComVaga.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center shadow-sm">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Nenhuma missão com vaga em aberto sob sua responsabilidade.</p>
          </div>
        ) : (
          eventosComVaga.map((evento) => {
            const vagasRestantes = evento.vagas - vagasOcupadas(evento.convocacoes)

            return (
              <Link key={evento.id} href={`/gcm/escalar/${evento.id}`}>
                <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                  <div className="p-4 flex items-center justify-between gap-3">
                    <div className="space-y-1.5 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{evento.codigo}</p>
                      <div className="flex items-center gap-2 text-slate-500 text-xs">
                        <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                        <span>{evento.dataServico.toLocaleDateString('pt-BR', { timeZone: 'UTC' })} às {evento.horario}</span>
                      </div>
                      <div className="flex items-start gap-2 text-slate-500 text-xs">
                        <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span className="truncate">{evento.local}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-full">
                        {vagasRestantes} vaga(s)
                      </span>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
