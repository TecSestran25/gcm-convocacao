// src/app/gcm/convocacoes/page.tsx
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { responderConvocacao } from "./actions"
import { Button } from "@/components/ui/button"
import { BotaoAtivarNotificacoes } from "@/components/BotaoAtivarNotificacoes"
// Importando ícones bonitos
import { CalendarDays, MapPin, Users, ShieldAlert, CheckCircle2, XCircle } from "lucide-react"

export default async function ConvocacoesGcmPage() {
  const session = await auth()
  const gcmId = session?.user?.id

  if (!gcmId) return null 

  const guarda = await prisma.usuario.findUnique({
    where: { id: gcmId },
    select: { equipe: true, nome: true } 
  })

  const minhaEquipe = guarda?.equipe || ""

  const eventos = await prisma.evento.findMany({
    where: {
      OR: [
        { equipePrioritaria: minhaEquipe },
        { equipePrioritaria: "TODAS" },
        { equipePrioritaria: "GERAL" }
      ]
    },
    orderBy: { dataServico: 'asc' }
  })

  const minhasRespostas = await prisma.convocacao.findMany({
    where: { gcmId }
  })

  const mapaRespostas = new Map(minhasRespostas.map(r => [r.eventoId, r.status]))

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="bg-slate-900 text-white justify-items-center px-4 py-8 shadow-md mb-6">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="bg-blue-600 p-3 rounded-full">
            <ShieldAlert className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Olá, GCM {guarda?.nome?.split(" ")[0]}</h1>
            <p className="text-slate-300 text-sm">Central de Escalas • Equipe {minhaEquipe}</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-6">
        <BotaoAtivarNotificacoes />

        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-slate-800">Próximas Missões</h2>
          <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
            {eventos.length} disponíveis
          </span>
        </div>

        <div className="space-y-4">
          {eventos.length === 0 && (
            <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center shadow-sm">
              <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Nenhuma escala para a sua equipe no momento.</p>
              <p className="text-sm text-slate-400 mt-1">Avisaremos quando houver novidades.</p>
            </div>
          )}

          {eventos.map((evento) => {
            const statusAtual = mapaRespostas.get(evento.id) || "PENDENTE"

            return (
              <div key={evento.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm transition-all hover:shadow-md">
                
                {/* Linha de Status Superior */}
                <div className={`px-4 py-2 flex justify-between items-center text-xs font-bold ${
                  statusAtual === "ACEITO" ? "bg-green-50 text-green-700 border-b border-green-100" :
                  statusAtual === "RECUSADO" ? "bg-red-50 text-red-700 border-b border-red-100" : 
                  statusAtual === "CONFIRMADO" ? "bg-blue-50 text-blue-700 border-b border-blue-100" : 
                  "bg-amber-50 text-amber-700 border-b border-amber-100"
                }`}>
                  <span>CÓDIGO: {evento.codigo}</span>
                  <span className="uppercase tracking-wider flex items-center gap-1">
                    {statusAtual === "CONFIRMADO" && <CheckCircle2 className="w-3 h-3" />}
                    {statusAtual === "RECUSADO" && <XCircle className="w-3 h-3" />}
                    {statusAtual}
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
                      <span>Alvo: {evento.equipePrioritaria}</span>
                    </div>
                  </div>
                </div>

                {/* Área de Botões (Rodapé do Cartão) */}
                <div className="p-4 bg-slate-50 flex gap-3 border-t border-slate-100">
                  <form action={responderConvocacao.bind(null, evento.id, "ACEITO")} className="flex-1">
                    <Button 
                      type="submit" 
                      className={`w-full font-bold h-11 rounded-xl transition-all ${
                        statusAtual === "CONFIRMADO" ? "bg-blue-600 hover:bg-blue-700 shadow-md" :
                        statusAtual === "ACEITO" ? "bg-green-600 hover:bg-green-700 shadow-md" : 
                        "bg-white text-green-700 border-2 border-green-600 hover:bg-green-50"
                      }`}
                      disabled={statusAtual === "ACEITO" || statusAtual === "CONFIRMADO"}
                    >
                      {statusAtual === "CONFIRMADO" ? "Homologado" : statusAtual === "ACEITO" ? "Aceito" : "Aceitar Escala"}
                    </Button>
                  </form>
                  
                  <form action={responderConvocacao.bind(null, evento.id, "RECUSADO")} className="flex-1">
                    <Button 
                      type="submit" 
                      variant="outline"
                      className={`w-full font-bold h-11 rounded-xl transition-all ${
                        statusAtual === "RECUSADO" ? "bg-red-50 text-red-700 border-red-200" : "text-slate-600 hover:text-red-600 hover:border-red-200"
                      }`}
                      disabled={statusAtual === "RECUSADO" || statusAtual === "CONFIRMADO"}
                    >
                      {statusAtual === "RECUSADO" ? "Recusado" : "Recusar"}
                    </Button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}