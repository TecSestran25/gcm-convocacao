// src/app/gcm/convocacoes/page.tsx
// O GCM não escolhe mais aceitar/recusar: o Líder é quem escala (Etapa "Escalar Guardas").
// Esta tela virou consulta somente leitura das escalas atuais/futuras deste GCM.
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { BotaoAtivarNotificacoes } from "@/components/BotaoAtivarNotificacoes"
import { CalendarDays, MapPin, Users, ShieldAlert, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"

const ROTULOS_STATUS: Record<string, string> = {
  CONFIRMADO: "Escalado",
  PRESENTE: "Presença Confirmada",
  AUSENTE: "Faltou",
  ATRASADO: "Atrasou",
  ATESTADO: "Atestado Médico",
  TROCA: "Substituído",
}

export default async function ConvocacoesGcmPage() {
  const session = await auth()
  const gcmId = session?.user?.id

  if (!gcmId) return null

  const guarda = await prisma.usuario.findUnique({
    where: { id: gcmId },
    select: { equipe: true, nome: true }
  })

  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const minhasEscalas = await prisma.convocacao.findMany({
    where: {
      gcmId,
      evento: { dataServico: { gte: hoje } }
    },
    include: { evento: true },
    orderBy: { evento: { dataServico: 'asc' } }
  })

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="bg-slate-900 text-white justify-items-center px-4 py-8 shadow-md mb-6">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="bg-blue-600 p-3 rounded-full">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Olá, GCM {guarda?.nome?.split(" ")[0]}</h1>
            <p className="text-slate-300 text-sm">Minhas Escalas • Equipe {guarda?.equipe || ""}</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-6">
        <BotaoAtivarNotificacoes />

        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-slate-800">Próximas Missões</h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
            {minhasEscalas.length} escala(s)
          </span>
        </div>

        <div className="space-y-4">
          {minhasEscalas.length === 0 && (
            <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center shadow-sm">
              <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Você ainda não foi escalado para nenhuma missão.</p>
              <p className="text-sm text-slate-400 mt-1">O Líder da sua equipe é quem define a escala.</p>
            </div>
          )}

          {minhasEscalas.map((escala) => {
            const evento = escala.evento
            const status = escala.status

            return (
              <div key={escala.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm transition-all hover:shadow-md">

                {/* Linha de Status Superior */}
                <div className={`px-4 py-2 flex justify-between items-center text-xs font-bold ${
                  status === "AUSENTE" ? "bg-red-50 text-red-700 border-b border-red-100" :
                  status === "ATRASADO" ? "bg-amber-50 text-amber-700 border-b border-amber-100" :
                  status === "TROCA" ? "bg-purple-50 text-purple-700 border-b border-purple-100" :
                  status === "PRESENTE" ? "bg-emerald-50 text-emerald-700 border-b border-emerald-100" :
                  "bg-blue-50 text-blue-700 border-b border-blue-100"
                }`}>
                  <span>CÓDIGO: {evento.codigo}</span>
                  <span className="uppercase tracking-wider flex items-center gap-1">
                    {status === "PRESENTE" && <CheckCircle2 className="w-3 h-3" />}
                    {status === "AUSENTE" && <XCircle className="w-3 h-3" />}
                    {(status === "ATRASADO" || status === "ATESTADO" || status === "TROCA") && <AlertTriangle className="w-3 h-3" />}
                    {ROTULOS_STATUS[status] ?? status}
                  </span>
                </div>

                {/* Corpo do Cartão */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-slate-800 font-semibold leading-tight">{evento.local}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <CalendarDays className="w-4 h-4 text-blue-500" />
                      <span>{evento.dataServico.toLocaleDateString('pt-BR', { timeZone: 'UTC' })} às {evento.horario}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 text-sm">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span>Equipe: {evento.equipePrioritaria}</span>
                    </div>
                  </div>

                  {escala.observacaoIncidente && (
                    <p className="text-xs text-slate-500 italic bg-slate-50 border border-slate-100 rounded-md p-2">
                      &quot;{escala.observacaoIncidente}&quot;
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
