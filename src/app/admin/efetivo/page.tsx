// src/app/admin/efetivo/page.tsx
import { prisma } from "@/lib/prisma"
import { eliminarGCM, alterarStatusGCM } from "./actions"
import { Button } from "@/components/ui/button"
import { Pesquisa } from "@/components/Pesquisa"
import { Paginacao } from "@/components/Paginacao"
import { BotaoAcao } from "@/components/BotaoAcao"
import { ModalNovoEfetivo } from "@/components/ModalNovoEfetivo"
import { TabelaEfetivo } from "@/components/TabelaEfetivo"
import Link from "next/link"
import { UserPlus } from "lucide-react"

const ITENS_POR_PAGINA = 8

export default async function EfetivoPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string, page?: string, sort?: string, order?: string }> 
}) {
  const resolvedParams = await searchParams
  const termoPesquisa = resolvedParams.q || ""
  const paginaAtual = Number(resolvedParams.page) || 1
  
  const sort = resolvedParams.sort || "nome"
  const order = resolvedParams.order || "asc"

  const filtroBusca = {
    role: { not: "ADMIN" as const },
    OR: [
      { nome: { contains: termoPesquisa, mode: "insensitive" as const } },
      { matricula: { contains: termoPesquisa } }
    ]
  }

  const totalGcms = await prisma.usuario.count({ where: filtroBusca })
  const totalPaginas = Math.ceil(totalGcms / ITENS_POR_PAGINA)

  const gcms = await prisma.usuario.findMany({
    where: filtroBusca,
    orderBy: { [sort]: order },
    take: ITENS_POR_PAGINA,
    skip: (paginaAtual - 1) * ITENS_POR_PAGINA
  })

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* ========================================== */}
      {/* CABEÇALHO E CONTROLES                      */}
      {/* ========================================== */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestão de Efetivo</h1>
          <p className="text-slate-500 text-sm md:text-base mt-1">Cadastre e gerencie os Guardas Municipais da corporação.</p>
        </div>
        
        <div className="w-full md:w-auto">
          <div className="hidden md:block">
            <ModalNovoEfetivo />
          </div>
          <Link href="/admin/efetivo/novo" className="md:hidden block">
            <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700 h-12 text-md">
              <UserPlus className="w-5 h-5" /> Novo GCM
            </Button>
          </Link>
        </div>
      </div>

      {/* ========================================== */}
      {/* LISTAGEM DE EFETIVO                        */}
      {/* ========================================== */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-800">Efetivo Cadastrado ({totalGcms})</h2>
          <div className="w-full md:w-auto md:min-w-80">
            <Pesquisa placeholder="Buscar por nome ou matrícula..." />
          </div>
        </div>

        {gcms.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 shadow-sm">
            {termoPesquisa ? "Nenhum GCM encontrado para esta pesquisa." : "Nenhum GCM cadastrado ainda."}
          </div>
        ) : (
          <>
            {/* VISÃO DESKTOP: TABELA INTERATIVA */}
            <div className="hidden md:block">
              <TabelaEfetivo gcms={gcms} />
            </div>

            {/* VISÃO MOBILE: CARDS */}
            <div className="grid md:hidden grid-cols-1 gap-4">
              {gcms.map((gcm) => (
                <div key={`mobile-${gcm.id}`} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="overflow-hidden">
                      <h3 className="font-bold text-slate-900 truncate">{gcm.nome}</h3>
                      <p className="text-sm text-slate-500 font-mono mt-0.5">{gcm.matricula}</p>
                    </div>
                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full whitespace-nowrap border ${
                      gcm.status === "ATIVO" ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}>
                      {gcm.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex flex-col bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Equipe</span>
                      <span className="font-bold text-slate-700">{gcm.equipe || "-"}</span>
                    </div>
                    <div className="flex flex-col bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">Cargo</span>
                      <span className="font-bold text-slate-700">{gcm.role}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-1 pt-3 border-t border-slate-100">
                    <Link href={`/admin/efetivo/${gcm.id}`} className="col-span-2">
                      <Button variant="secondary" className="w-full bg-slate-900 text-white hover:bg-slate-800">Editar Perfil</Button>
                    </Link>
                    <BotaoAcao 
                      action={alterarStatusGCM.bind(null, gcm.id, gcm.status as "ATIVO" | "INATIVO")} 
                      label="Status" variant="outline" mensagemSucesso="Status atualizado!" 
                    />
                    <BotaoAcao 
                      action={eliminarGCM.bind(null, gcm.id)} 
                      label="Apagar" variant="destructive" mensagemSucesso="Removido." 
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        {totalPaginas > 1 && (
          <div className="pt-4 border-t border-slate-200">
            <Paginacao totalPaginas={totalPaginas} />
          </div>
        )}
      </div>
    </div>
  )
}