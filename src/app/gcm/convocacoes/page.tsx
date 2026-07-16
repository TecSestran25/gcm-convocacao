// src/app/gcm/convocacoes/page.tsx
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { responderConvocacao } from "./actions"
import { Button } from "@/components/ui/button"

export default async function ConvocacoesGcmPage() {
  const session = await auth()
  const gcmId = session?.user?.id

  if (!gcmId) return null // Proteção de segurança

  // 1. Busca os dados do guarda no banco para descobrir a sua equipa
  const guarda = await prisma.usuario.findUnique({
    where: { id: gcmId },
    select: { equipe: true } // Trazemos apenas a equipa para ser mais rápido
  })

  const minhaEquipe = guarda?.equipe || ""

  // 2. Procura APENAS os eventos direcionados para a equipa do guarda (ou eventos globais)
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

  // 3. Procura as respostas que este guarda específico já deu
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
            Nenhum evento operacional direcionado à sua equipa ({minhaEquipe}) no momento.
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
                    statusAtual === "RECUSADO" ? "bg-red-100 text-red-800" : 
                    statusAtual === "CONFIRMADO" ? "bg-blue-100 text-blue-800" : "bg-yellow-100 text-yellow-800"
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

              {/* Botões com bloqueio inteligente baseado no status atual */}
              <div className="flex gap-2 sm:self-center">
                <form action={responderConvocacao.bind(null, evento.id, "ACEITO")}>
                  <Button 
                    type="submit" 
                    variant={statusAtual === "ACEITO" || statusAtual === "CONFIRMADO" ? "default" : "outline"}
                    className={
                      statusAtual === "CONFIRMADO" ? "bg-blue-600 opacity-100" :
                      statusAtual === "ACEITO" ? "bg-green-600 opacity-100" : ""
                    }
                    disabled={statusAtual === "ACEITO" || statusAtual === "CONFIRMADO"}
                  >
                    {statusAtual === "CONFIRMADO" ? "Confirmado" : statusAtual === "ACEITO" ? "✓ Aceito" : "Aceitar"}
                  </Button>
                </form>
                
                <form action={responderConvocacao.bind(null, evento.id, "RECUSADO")}>
                  <Button 
                    type="submit" 
                    variant={statusAtual === "RECUSADO" ? "destructive" : "outline"}
                    className={statusAtual === "RECUSADO" ? "opacity-100" : ""}
                    disabled={statusAtual === "RECUSADO" || statusAtual === "CONFIRMADO"}
                  >
                    {statusAtual === "RECUSADO" ? "✕ Recusado" : "Recusar"}
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