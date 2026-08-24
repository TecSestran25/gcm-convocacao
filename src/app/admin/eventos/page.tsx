// src/app/admin/eventos/page.tsx
import { prisma } from "@/lib/prisma"
import { eliminarEvento } from "./actions"
import { Button } from "@/components/ui/button"
import { Pesquisa } from "@/components/Pesquisa"
import { Paginacao } from "@/components/Paginacao"
import { BotaoAcao } from "@/components/BotaoAcao" 
import { ModalNovoEvento } from "@/components/ModalNovoEvento"
import { TabelaEventos } from "@/components/TabelaEventos"
import { buscarDadosFormularioEvento } from "@/lib/dados-formulario-evento"
import Link from "next/link"
import { Plus } from "lucide-react"

const ITENS_POR_PAGINA = 10

export default async function EventosPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string, page?: string, sort?: string, order?: string }> 
}) {
  const resolvedParams = await searchParams
  const termoPesquisa = resolvedParams.q || ""
  const paginaAtual = Number(resolvedParams.page) || 1
  
  // Parâmetros de Ordenação (Defaults para Data Decrescente)
  const sort = resolvedParams.sort || "dataServico"
  const order = resolvedParams.order || "desc"

  const filtroBusca = {
    OR: [
      { codigo: { contains: termoPesquisa, mode: "insensitive" as const } },
      { local: { contains: termoPesquisa, mode: "insensitive" as const } }
    ]
  }

  const totalEventos = await prisma.evento.count({ where: filtroBusca })
  const totalPaginas = Math.ceil(totalEventos / ITENS_POR_PAGINA)

  const eventos = await prisma.evento.findMany({
    where: filtroBusca,
    orderBy: { [sort]: order }, // Aplica a ordenação dinâmica vinda da URL
    take: ITENS_POR_PAGINA,
    skip: (paginaAtual - 1) * ITENS_POR_PAGINA
  })

  const { equipes, lideres } = await buscarDadosFormularioEvento()

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* ========================================== */}
      {/* CABEÇALHO E CONTROLES                      */}
      {/* ========================================== */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestão de Eventos</h1>
          <p className="text-slate-500 text-sm md:text-base mt-1">Controle de missões operacionais e convocações da GECP.</p>
        </div>
        
        <div className="w-full md:w-auto">
          <div className="hidden md:block">
            <ModalNovoEvento equipes={equipes} lideres={lideres} />
          </div>
          <Link href="/admin/eventos/novo" className="md:hidden block">
            <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700 h-12 text-md">
              <Plus className="w-5 h-5" /> Nova Escala
            </Button>
          </Link>
        </div>
      </div>

      {/* ========================================== */}
      {/* LISTAGEM DE EVENTOS                        */}
      {/* ========================================== */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-800">Histórico de Convocações ({totalEventos})</h2>
          <div className="w-full md:w-auto md:min-w-80">
            <Pesquisa placeholder="Buscar por código ou local..." />
          </div>
        </div>

        {eventos.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm">
            {termoPesquisa ? "Nenhum evento encontrado para esta pesquisa." : "Ainda não existem convocações cadastradas."}
          </div>
        ) : (
          <>
            {/* Tabela Interativa (Desktop) - Recheada com o componente Client */}
            <div className="hidden md:block">
              <TabelaEventos eventos={eventos} />
            </div>

            {/* Visão Mobile (Cards com todos os botões restaurados) */}
            <div className="grid md:hidden grid-cols-1 gap-4">
              {eventos.map((evento) => (
                <div key={`mobile-${evento.id}`} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900">{evento.codigo}</h3>
                      <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">{evento.local}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">
                      {evento.vagas} Vagas
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <div><span className="font-medium block text-slate-400 text-xs uppercase mb-0.5">Data</span> {evento.dataServico.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</div>
                    <div><span className="font-medium block text-slate-400 text-xs uppercase mb-0.5">Hora</span> {evento.horario}</div>
                    <div className="col-span-2 mt-1 pt-2 border-t border-slate-200"><span className="font-medium block text-slate-400 text-xs uppercase mb-0.5">Equipe Alvo</span> <span className="font-semibold">{evento.equipePrioritaria}</span></div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                    <Link href={`/admin/eventos/${evento.id}`}>
                      <Button variant="secondary" size="sm" className="w-full bg-slate-900 text-white hover:bg-slate-800">Ver</Button>
                    </Link>
                    <Link href={`/admin/eventos/${evento.id}/editar`}>
                      <Button variant="outline" size="sm" className="w-full">Editar</Button>
                    </Link>
                    <BotaoAcao 
                      action={eliminarEvento.bind(null, evento.id)} 
                      label="Apagar" 
                      variant="destructive"
                      mensagemSucesso="Removido." 
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Paginação Shadcn UI */}
        {totalPaginas > 1 && (
          <div className="pt-4 border-t border-slate-200">
            <Paginacao totalPaginas={totalPaginas} />
          </div>
        )}
      </div>
    </div>
  )
}