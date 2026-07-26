/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown, Eye, Edit, Trash } from "lucide-react"
import { eliminarEvento } from "@/app/admin/eventos/actions"
import { useTransition } from "react"
import { toast } from "sonner" // Assumindo que você usa o sonner para toasts, se não, pode remover

type Evento = {
  id: string
  codigo: string
  dataServico: Date
  horario: string
  local: string
  equipePrioritaria: string
  vagas: number
}

export function TabelaEventos({ eventos }: { eventos: Evento[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Função para alternar a ordenação na URL
  const toggleSort = (coluna: string) => {
    const params = new URLSearchParams(searchParams)
    const currentSort = params.get("sort")
    const currentOrder = params.get("order")

    if (currentSort === coluna) {
      params.set("order", currentOrder === "asc" ? "desc" : "asc")
    } else {
      params.set("sort", coluna)
      params.set("order", "asc")
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  // Define qual ícone mostrar no cabeçalho
  const renderSortIcon = (coluna: string) => {
    if (searchParams.get("sort") !== coluna) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
    return searchParams.get("order") === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja apagar esta convocação? Esta ação não pode ser desfeita.")) {
      startTransition(async () => {
        try {
          await eliminarEvento(id)
          toast.success("Evento removido com sucesso!")
        } catch (error) {
          toast.error("Erro ao remover o evento.")
        }
      })
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/80 border-b border-slate-200">
          <TableRow>
            <TableHead className="font-bold text-slate-700">
              <Button variant="ghost" onClick={() => toggleSort("codigo")} className="hover:bg-slate-200 -ml-4">
                Código {renderSortIcon("codigo")}
              </Button>
            </TableHead>
            <TableHead className="font-bold text-slate-700">
              <Button variant="ghost" onClick={() => toggleSort("dataServico")} className="hover:bg-slate-200 -ml-4">
                Data {renderSortIcon("dataServico")}
              </Button>
            </TableHead>
            <TableHead className="font-bold text-slate-700">Horário</TableHead>
            <TableHead className="font-bold text-slate-700">Local</TableHead>
            <TableHead className="font-bold text-slate-700">Equipe</TableHead>
            <TableHead className="font-bold text-slate-700">Vagas</TableHead>
            <TableHead className="text-right font-bold text-slate-700">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {eventos.map((evento) => (
            <TableRow 
              key={evento.id} 
              className="hover:bg-slate-50 transition-colors cursor-pointer"
              // Ao clicar na linha (em qualquer lugar), vai para os detalhes
              onClick={() => router.push(`/admin/eventos/${evento.id}`)}
            >
              <TableCell className="font-semibold text-slate-800">{evento.codigo}</TableCell>
              <TableCell>{evento.dataServico.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
              <TableCell>{evento.horario}</TableCell>
              <TableCell>{evento.local}</TableCell>
              <TableCell>
                <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-bold">
                  {evento.equipePrioritaria}
                </span>
              </TableCell>
              <TableCell>{evento.vagas}</TableCell>
              <TableCell className="text-right">
                
                {/* MENU DROPDOWN DE AÇÕES (Igual ao da imagem referência) */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="h-8 w-8 p-0"
                      // STOP PROPAGATION é vital para não ativar o clique da linha inteira
                      onClick={(e) => e.stopPropagation()} 
                    >
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push(`/admin/eventos/${evento.id}`)}>
                      <Eye className="mr-2 h-4 w-4" /> Ver detalhes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push(`/admin/eventos/${evento.id}/editar`)}>
                      <Edit className="mr-2 h-4 w-4" /> Editar evento
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDelete(evento.id)}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                      disabled={isPending}
                    >
                      <Trash className="mr-2 h-4 w-4" /> 
                      {isPending ? "Apagando..." : "Apagar evento"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}