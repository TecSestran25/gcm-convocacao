// src/app/admin/dashboard/page.tsx
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { AutoRefresh } from "@/components/AutoRefresh"
import { BotaoAtivarNotificacoes } from "@/components/BotaoAtivarNotificacoes"

// Importando ícones para enriquecer o painel
import { Users, CalendarDays, ShieldAlert, ArrowRight, MapPin, LayoutDashboard } from "lucide-react"

export default async function DashboardPage() {
  // 1. Busca os números gerais
  const totalEfetivo = await prisma.usuario.count({
    where: { role: "GCM", status: "ATIVO" }
  })

  // Para não mostrar eventos velhos, pegamos a data de hoje
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const totalEventosFuturos = await prisma.evento.count({
    where: { dataServico: { gte: hoje } }
  })

  // 2. Busca os 3 próximos eventos em destaque
  const proximosEventos = await prisma.evento.findMany({
    where: { dataServico: { gte: hoje } },
    orderBy: { dataServico: 'asc' },
    take: 3,
    include: {
      convocacoes: true 
    }
  })

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <AutoRefresh interval={10000} />

      {/* ========================================== */}
      {/* CABEÇALHO DO PAINEL                        */}
      {/* ========================================== */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-blue-100 p-2 rounded-lg">
              <LayoutDashboard className="w-6 h-6 text-blue-700" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Painel de Comando</h1>
          </div>
          <p className="text-slate-500 mt-2 md:mt-1 ml-1 md:ml-12">Visão geral do efetivo e convocações operacionais da GECP.</p>
        </div>
      </div>
        <BotaoAtivarNotificacoes />
      {/* ========================================== */}
      {/* LINHA 1: WIDGETS DE ESTATÍSTICAS RÁPIDAS   */}
      {/* ========================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Widget: Efetivo */}
        <Card className="relative overflow-hidden border-none shadow-md bg-gradient-to-br from-blue-600 to-blue-800 text-white">
          <div className="absolute top-4 right-4 opacity-20">
            <Users className="w-24 h-24" />
          </div>
          <CardHeader className="pb-2 relative z-10">
            <CardDescription className="font-semibold text-blue-100 uppercase tracking-wider">Efetivo Ativo</CardDescription>
            <CardTitle className="text-5xl font-extrabold mt-2">{totalEfetivo}</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 mt-2">
            <p className="text-sm text-blue-200 font-medium">Guardas disponíveis para escala.</p>
          </CardContent>
        </Card>

        {/* Widget: Missões Futuras */}
        <Card className="relative overflow-hidden border-none shadow-md bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
          <div className="absolute top-4 right-4 opacity-20">
            <ShieldAlert className="w-24 h-24" />
          </div>
          <CardHeader className="pb-2 relative z-10">
            <CardDescription className="font-semibold text-emerald-100 uppercase tracking-wider">Missões Futuras</CardDescription>
            <CardTitle className="text-5xl font-extrabold mt-2">{totalEventosFuturos}</CardTitle>
          </CardHeader>
          <CardContent className="relative z-10 mt-2">
            <p className="text-sm text-emerald-100 font-medium">Eventos agendados a partir de hoje.</p>
          </CardContent>
        </Card>

        {/* Widget: Ações Rápidas */}
        <Card className="border-slate-200 shadow-sm flex flex-col justify-between bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg text-slate-800">Ações Rápidas</CardTitle>
            <CardDescription className="text-slate-500">Atalhos do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/admin/eventos" className="block">
              <Button variant="outline" className="w-full justify-between h-12 text-slate-700 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-200 transition-all">
                <span className="flex items-center gap-2"><CalendarDays className="w-4 h-4"/> Gerenciar Eventos</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Button>
            </Link>
            <Link href="/admin/usuarios" className="block">
              <Button variant="outline" className="w-full justify-between h-12 text-slate-700 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-200 transition-all">
                <span className="flex items-center gap-2"><Users className="w-4 h-4"/> Gerenciar Efetivo</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </Button>
            </Link>
          </CardContent>
        </Card>

      </div>

      {/* ========================================== */}
      {/* LINHA 2: RESUMO DOS PRÓXIMOS EVENTOS       */}
      {/* ========================================== */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <CalendarDays className="w-6 h-6 text-slate-600" />
          <h2 className="text-xl font-bold text-slate-800">Próximas Escalas</h2>
        </div>
        
        {proximosEventos.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center flex flex-col items-center justify-center shadow-sm">
            <ShieldAlert className="w-12 h-12 text-slate-300 mb-3" />
            <h3 className="text-lg font-bold text-slate-700 mb-1">Caminho Livre</h3>
            <p className="text-slate-500">Não há eventos operacionais futuros cadastrados no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {proximosEventos.map(evento => {
              const confirmados = evento.convocacoes.filter(c => c.status === "CONFIRMADO").length
              const lotado = confirmados >= evento.vagas
              const porcentagem = Math.min((confirmados / evento.vagas) * 100, 100)

              return (
                <Card key={evento.id} className="shadow-sm border-slate-200 flex flex-col transition-all hover:shadow-md hover:border-blue-200 overflow-hidden">
                  
                  {/* Faixa superior decorativa */}
                  <div className={`h-1.5 w-full ${lotado ? 'bg-amber-500' : 'bg-blue-600'}`}></div>
                  
                  <CardHeader className="pb-4 pt-5">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="bg-slate-100 text-slate-600 border-slate-200 font-bold tracking-wider">
                        {evento.codigo}
                      </Badge>
                      <Badge variant={lotado ? "default" : "default"} className={lotado ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-emerald-500 hover:bg-emerald-600 text-white"}>
                        {lotado ? "LOTAÇÃO MÁXIMA" : "VAGAS ABERTAS"}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg text-slate-800 leading-tight flex items-start gap-2 mt-3">
                      <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{evento.local}</span>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col">
                    <div className="flex items-center gap-2 text-sm text-slate-600 mb-6 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <CalendarDays className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">
                        {evento.dataServico.toLocaleDateString('pt-BR', { timeZone: 'UTC' })} às {evento.horario}
                      </span>
                    </div>
                    
                    <div className="mt-auto mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-500 font-medium">Preenchimento da Escala</span>
                        <span className="font-bold text-slate-700">{confirmados} de {evento.vagas}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${lotado ? 'bg-amber-500' : 'bg-blue-500'}`} 
                          style={{ width: `${porcentagem}%` }}
                        ></div>
                      </div>
                    </div>

                    <Link href={`/admin/eventos/${evento.id}`}>
                      <Button className="w-full font-semibold shadow-sm transition-all bg-slate-900 hover:bg-slate-800 text-white">
                        Gerenciar Escala
                      </Button>
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