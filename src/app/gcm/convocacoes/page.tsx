// src/app/gcm/convocacoes/page.tsx
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { responderConvocacao } from "./actions"
import { Button } from "@/components/ui/button"

export default async function ConvocacoesGcmPage() {
  const session = await auth()
  const gcmId = session?.user?.id

  // 1. Procura todos os eventos criados pela chefia
  const eventos = await prisma.evento.findMany({
    orderBy: { dataServico: 'asc' }
  })

  // 2. Procura as respostas que este guarda específico já deu
  const minhasRespostas = await prisma.convocacao.findMany({
    where: { gcmId }
  })

  // Cria um mapa rápido para descobrir o status de cada evento sem fazer loops pesados
  const mapaRespostas = new Map(minhasRespostas.map(r => [r.eventoId, r.status]))

  return (
    <div className="space-y-6 max-w-3xl mx-auto p-4">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Serviços Extra Disponíveis</h1>
        <p className="text-sm text-slate-500">Responda com a sua disponibilidade para as escalas.</p>
      </div>

      <div className="space-y-4">
        {eventos.length === 0 && (
          <p className="text-slate-500 text-center py-8 bg-white rounded border">
            Nenhum evento operacional publicado de momento.
          </p>
        )}

        {eventos.map((evento) => {
          const statusAtual = mapaRespostas.get(evento.id) || "PENDENTE"

          return (
            <div key={evento.id} className="bg-white p-4 rounded-md border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">{evento.codigo}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    statusAtual === "ACEITO" ? "bg-green-100 text-green-800" :
                    statusAtual === "RECUSADO" ? "bg-red-100 text-red-800" : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {statusAtual}
                  </span>
                </div>
                <p className="text-sm text-slate-700">
                  <b>Data:</b> {evento.dataServico.toLocaleDateString('pt-BR', { timeZone: 'UTC' })} | <b>Horário:</b> {evento.horario}
                </p>
                <p className="text-sm text-slate-700"><b>Missão:</b> {evento.local}</p>
                <p className="text-xs text-slate-400">Equipa Alvo: {evento.equipePrioritaria}</p>
              </div>

              {/* Botões com Server Actions acopladas */}
              <div className="flex gap-2 sm:self-center">
                <form action={responderConvocacao.bind(null, evento.id, "ACEITO")}>
                  <Button 
                    type="submit" 
                    variant={statusAtual === "ACEITO" ? "default" : "outline"}
                    className={statusAtual === "ACEITO" ? "bg-green-600 hover:bg-green-700" : ""}
                  >
                    Aceitar
                  </Button>
                </form>
                
                <form action={responderConvocacao.bind(null, evento.id, "RECUSADO")}>
                  <Button 
                    type="submit" 
                    variant={statusAtual === "RECUSADO" ? "destructive" : "outline"}
                  >
                    Recusar
                  </Button>
                </form>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}