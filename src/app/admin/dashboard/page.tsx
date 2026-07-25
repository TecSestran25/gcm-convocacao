// src/app/admin/dashboard/page.tsx
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { AutoRefresh } from "@/components/AutoRefresh" // <-- Nosso motor de tempo real
import { BotaoAtivarNotificacoes } from "@/components/BotaoAtivarNotificacoes"

export default async function DashboardPage() {
  // 1. Busca os números gerais para os "Cards" de estatística
  const totalEfetivo = await prisma.usuario.count({
    where: { role: "GCM", status: "ATIVO" }
  })

  // Para não mostrar eventos velhos, pegamos a data de hoje
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0) // Zera as horas para pegar o dia inteiro

  const totalEventosFuturos = await prisma.evento.count({
    where: { dataServico: { gte: hoje } }
  })

  // 2. Busca os 3 próximos eventos em destaque para o Comando ver logo de cara
  const proximosEventos = await prisma.evento.findMany({
    where: { dataServico: { gte: hoje } },
    orderBy: { dataServico: 'asc' },
    take: 3,
    include: {
      convocacoes: true 
    }
  })

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* O Motor invisível rodando no Dashboard a cada 10 segundos */}
      <AutoRefresh interval={10000} />
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Painel de Comando</h1>
        <p className="text-slate-500 mt-1">Visão geral do efetivo e convocações operacionais da GECP.</p>
      </div>
      <div>
        <BotaoAtivarNotificacoes />
      </div>

      {/* ========================================== */}
      {/* LINHA 1: CARDS DE ESTATÍSTICAS RÁPIDAS     */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-600 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-semibold text-slate-500 uppercase tracking-wider">Efetivo Ativo</CardDescription>
            <CardTitle className="text-4xl text-slate-800">{totalEfetivo}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400">Guardas disponíveis para escala.</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-semibold text-slate-500 uppercase tracking-wider">Missões Futuras</CardDescription>
            <CardTitle className="text-4xl text-slate-800">{totalEventosFuturos}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-400">Eventos agendados a partir de hoje.</p>
          </CardContent>
        </Card>

        {/* Card de Atalho Rápido */}
        <Card className="bg-slate-900 text-white shadow-sm flex flex-col justify-center">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Ações Rápidas</CardTitle>
            <CardDescription className="text-slate-400">Gestão do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/eventos" className="block">
              <Button className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700">Gerenciar Eventos</Button>
            </Link>
            <Link href="/admin/efetivo" className="block">
              <Button className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700">Gerenciar Efetivo</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* ========================================== */}
      {/* LINHA 2: RESUMO DOS PRÓXIMOS EVENTOS       */}
      {/* ========================================== */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 mb-4">Próximas Escalas</h2>
        {proximosEventos.length === 0 ? (
          <div className="bg-white p-6 rounded-md border border-slate-200 text-center text-slate-500">
            Não há eventos futuros cadastrados no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {proximosEventos.map(evento => {
              // Calcula quantas vagas já foram confirmadas
              const confirmados = evento.convocacoes.filter(c => c.status === "CONFIRMADO").length
              const statusVagas = confirmados >= evento.vagas ? "LOTAÇÃO MÁXIMA" : "VAGAS ABERTAS"

              return (
                <Card key={evento.id} className="shadow-sm border-slate-200">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg text-slate-800">{evento.codigo}</CardTitle>
                      <Badge variant={confirmados >= evento.vagas ? "destructive" : "default"} className={confirmados < evento.vagas ? "bg-green-600" : ""}>
                        {statusVagas}
                      </Badge>
                    </div>
                    <CardDescription className="font-medium text-slate-900 mt-1">
                      {evento.dataServico.toLocaleDateString('pt-BR', { timeZone: 'UTC' })} • {evento.horario}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-1">{evento.local}</p>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-500">Preenchimento:</span>
                        <span className="font-bold">{confirmados} / {evento.vagas}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${confirmados >= evento.vagas ? 'bg-red-500' : 'bg-blue-500'}`} 
                          style={{ width: `${Math.min((confirmados / evento.vagas) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <Link href={`/admin/eventos/${evento.id}`}>
                      <Button variant="outline" className="w-full text-sm">Ver Detalhes</Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}