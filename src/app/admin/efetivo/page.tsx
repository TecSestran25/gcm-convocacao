// src/app/admin/efetivo/page.tsx
import { prisma } from "@/lib/prisma"
import { criarGCM, eliminarGCM, alterarStatusGCM } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Pesquisa } from "@/components/Pesquisa"
import { Paginacao } from "@/components/Paginacao"
import { BotaoAcao } from "@/components/BotaoAcao"

const ITENS_POR_PAGINA = 10 

export default async function EfetivoPage({ searchParams }: { searchParams: Promise<{ q?: string, page?: string }> }) {
  const resolvedParams = await searchParams
  const termoPesquisa = resolvedParams.q || ""
  const paginaAtual = Number(resolvedParams.page) || 1

  const filtroBusca = {
    role: "GCM" as const,
    OR: [
      { nome: { contains: termoPesquisa, mode: "insensitive" as const } },
      { matricula: { contains: termoPesquisa } }
    ]
  }

  const totalGcms = await prisma.usuario.count({ where: filtroBusca })
  const totalPaginas = Math.ceil(totalGcms / ITENS_POR_PAGINA)

  const gcms = await prisma.usuario.findMany({
    where: filtroBusca,
    orderBy: { nome: 'asc' },
    take: ITENS_POR_PAGINA,
    skip: (paginaAtual - 1) * ITENS_POR_PAGINA
  })

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Gestão de Efetivo</h1>
        <p className="text-slate-500 text-sm md:text-base">Cadastre e gerencie os Guardas Municipais.</p>
      </div>

      {/* Formulário adaptado para mobile e PC */}
      <div className="bg-white p-4 rounded-md border border-slate-200">
        <form action={criarGCM} className="flex flex-col md:flex-row gap-4 md:items-end">
          <div className="space-y-1 flex-1">
            <label className="text-sm font-medium">Nome Completo</label>
            <Input name="nome" required placeholder="Ex: JOÃO DA SILVA" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-1 w-full sm:w-32">
              <label className="text-sm font-medium">Matrícula</label>
              <Input name="matricula" required placeholder="Ex: 12345" />
            </div>
            <div className="space-y-1 w-full sm:w-32">
              <label className="text-sm font-medium">Equipe</label>
              <Input name="equipe" required placeholder="Ex: ALFA" />
            </div>
          </div>
          <Button type="submit" className="w-full md:w-auto mt-2 md:mt-0">Cadastrar</Button>
        </form>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-800">Lista de GCMs ({totalGcms})</h2>
          <div className="w-full md:w-auto">
            <Pesquisa placeholder="Buscar por nome ou matrícula..." />
          </div>
        </div>

        {gcms.length === 0 ? (
          <div className="bg-white rounded-md border border-slate-200 p-8 text-center text-slate-500">
            {termoPesquisa ? "Nenhum GCM encontrado para esta pesquisa." : "Nenhum GCM cadastrado ainda."}
          </div>
        ) : (
          <>
            {/* ========================================== */}
            {/*           VISÃO DESKTOP: TABELA            */}
            {/* ========================================== */}
            <div className="hidden md:block bg-white rounded-md border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Matrícula</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Equipe</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {gcms.map((gcm) => (
                    <TableRow key={gcm.id}>
                      <TableCell className="font-medium">{gcm.matricula}</TableCell>
                      <TableCell>{gcm.nome}</TableCell>
                      <TableCell>{gcm.equipe || "-"}</TableCell>
                      <TableCell>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                          gcm.status === "ATIVO" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"
                        }`}>
                          {gcm.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Link href={`/admin/efetivo/${gcm.id}`}>
                          <Button variant="outline" size="sm">Editar</Button>
                        </Link>
                        <BotaoAcao 
                          action={alterarStatusGCM.bind(null, gcm.id, gcm.status as "ATIVO" | "INATIVO")} 
                          label="Status" 
                          variant="secondary"
                          mensagemSucesso="Status atualizado!" 
                        />
                        <BotaoAcao 
                          action={eliminarGCM.bind(null, gcm.id)} 
                          label="Eliminar" 
                          variant="destructive"
                          mensagemSucesso="Guarda removido." 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* ========================================== */}
            {/*            VISÃO MOBILE: CARDS             */}
            {/* ========================================== */}
            <div className="grid md:hidden grid-cols-1 gap-4">
              {gcms.map((gcm) => (
                <div key={`mobile-${gcm.id}`} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                  <div className="flex justify-between items-start gap-2 mb-4">
                    <div className="overflow-hidden">
                      <h3 className="font-bold text-slate-900 truncate">{gcm.nome}</h3>
                      <p className="text-sm text-slate-500 font-mono mt-0.5">{gcm.matricula}</p>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${
                      gcm.status === "ATIVO" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"
                    }`}>
                      {gcm.status}
                    </span>
                  </div>
                  <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm bg-slate-50 w-fit px-3 py-1.5 rounded text-slate-700 border border-slate-100">
                      <span className="font-medium text-slate-500">Equipe:</span>
                      <span className="font-bold">{gcm.equipe || "-"}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-slate-100">
                    <Link href={`/admin/efetivo/${gcm.id}`} className="col-span-2">
                      <Button variant="outline" size="sm" className="w-full">Editar Dados</Button>
                    </Link>
                    <BotaoAcao 
                      action={alterarStatusGCM.bind(null, gcm.id, gcm.status as "ATIVO" | "INATIVO")} 
                      label="Status" variant="secondary" mensagemSucesso="Status atualizado!" 
                    />
                    <BotaoAcao 
                      action={eliminarGCM.bind(null, gcm.id)} 
                      label="Eliminar" variant="destructive" mensagemSucesso="Guarda removido." 
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Paginação Comum às Duas Visões */}
        {totalPaginas > 1 && (
          <div className="pt-2">
            <Paginacao totalPaginas={totalPaginas} />
          </div>
        )}
      </div>
    </div>
  )
}