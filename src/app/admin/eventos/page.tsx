// src/app/admin/eventos/page.tsx
import { prisma } from "@/lib/prisma"
import { criarEvento, eliminarEvento } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pesquisa } from "@/components/Pesquisa"
import { Paginacao } from "@/components/Paginacao"
import { BotaoAcao } from "@/components/BotaoAcao" // <-- Importando o Botão com Toast
import Link from "next/link"

const ITENS_POR_PAGINA = 10

export default async function EventosPage({ searchParams }: { searchParams: Promise<{ q?: string, page?: string }> }) {
  const resolvedParams = await searchParams
  const termoPesquisa = resolvedParams.q || ""
  const paginaAtual = Number(resolvedParams.page) || 1

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
    orderBy: { dataServico: 'desc' },
    take: ITENS_POR_PAGINA,
    skip: (paginaAtual - 1) * ITENS_POR_PAGINA
  })

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Gestão de Eventos (GECP)</h1>
        <p className="text-slate-500 text-sm md:text-base">Crie e remova convocações operacionais.</p>
      </div>

      {/* ========================================== */}
      {/* FORMULÁRIO (Responsivo)                    */}
      {/* ========================================== */}
      <div className="bg-white p-4 rounded-md border border-slate-200">
        <form action={criarEvento} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-sm font-medium">Data</label>
            <Input name="dataServico" type="date" required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Horário</label>
            <Input name="horario" required placeholder="Ex: 08:00 - 20:00" />
          </div>
          <div className="space-y-1 sm:col-span-2 md:col-span-1">
            <label className="text-sm font-medium">Local/Missão</label>
            <Input name="local" required placeholder="Ex: PATRULHAMENTO" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Vagas</label>
            <Input name="vagas" type="number" min="1" required placeholder="Ex: 4" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Equipe Alvo</label>
            <Input name="equipePrioritaria" required placeholder="Ex: ALFA" />
          </div>
          <Button type="submit" className="sm:col-span-2 md:col-span-5 w-full">Publicar Convocação</Button>
        </form>
      </div>

      {/* ========================================== */}
      {/*         LISTAGEM (Tabela e Cards)          */}
      {/* ========================================== */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-800">Lista de Convocações ({totalEventos})</h2>
          <div className="w-full md:w-auto">
            <Pesquisa placeholder="Buscar por código ou local..." />
          </div>
        </div>

        {eventos.length === 0 ? (
          <div className="bg-white rounded-md border border-slate-200 p-8 text-center text-slate-500">
            {termoPesquisa ? "Nenhum evento encontrado para esta pesquisa." : "Nenhum evento registrado."}
          </div>
        ) : (
          <>
            {/* VISÃO DESKTOP: TABELA (Oculta no Mobile) */}
            <div className="hidden md:block bg-white rounded-md border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Horário</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead>Equipe</TableHead>
                    <TableHead>Vagas</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventos.map((evento) => (
                    <TableRow key={evento.id}>
                      <TableCell className="font-medium">{evento.codigo}</TableCell>
                      <TableCell>{evento.dataServico.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                      <TableCell>{evento.horario}</TableCell>
                      <TableCell>{evento.local}</TableCell>
                      <TableCell>{evento.equipePrioritaria}</TableCell>
                      <TableCell>{evento.vagas}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Link href={`/admin/eventos/${evento.id}`}>
                          <Button variant="secondary" size="sm">Detalhes</Button>
                        </Link>
                        <Link href={`/admin/eventos/${evento.id}/editar`}>
                          <Button variant="outline" size="sm">Editar</Button>
                        </Link>
                        <BotaoAcao 
                          action={eliminarEvento.bind(null, evento.id)} 
                          label="Eliminar" 
                          variant="destructive"
                          mensagemSucesso="Evento removido com sucesso." 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* VISÃO MOBILE: CARDS (Oculta no Desktop) */}
            <div className="grid md:hidden grid-cols-1 gap-4">
              {eventos.map((evento) => (
                <div key={`mobile-${evento.id}`} className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900">{evento.codigo}</h3>
                      <p className="text-sm text-slate-500 mt-0.5">{evento.local}</p>
                    </div>
                    <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2 py-1 rounded">
                      {evento.vagas} Vagas
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-slate-600 mb-4 bg-slate-50 p-2 rounded border border-slate-100">
                    <div><span className="font-medium">Data:</span> {evento.dataServico.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</div>
                    <div><span className="font-medium">Hora:</span> {evento.horario}</div>
                    <div className="col-span-2"><span className="font-medium">Equipe Alvo:</span> {evento.equipePrioritaria}</div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                    <Link href={`/admin/eventos/${evento.id}`}>
                      <Button variant="secondary" size="sm" className="w-full">Ver</Button>
                    </Link>
                    <Link href={`/admin/eventos/${evento.id}/editar`}>
                      <Button variant="outline" size="sm" className="w-full">Editar</Button>
                    </Link>
                    <BotaoAcao 
                      action={eliminarEvento.bind(null, evento.id)} 
                      label="Excluir" 
                      variant="destructive"
                      mensagemSucesso="Evento removido." 
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {totalPaginas > 1 && (
          <div className="pt-2">
            <Paginacao totalPaginas={totalPaginas} />
          </div>
        )}
      </div>
    </div>
  )
}