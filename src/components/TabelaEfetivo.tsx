/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/TabelaEfetivo.tsx
"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown, Edit, Trash, Power } from "lucide-react"
import { eliminarGCM, alterarStatusGCM } from "@/app/admin/efetivo/actions"
import { useTransition } from "react"
import { toast } from "sonner"

export function TabelaEfetivo({ gcms }: { gcms: any[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

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

  const renderSortIcon = (coluna: string) => {
    if (searchParams.get("sort") !== coluna) return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
    return searchParams.get("order") === "asc" ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
  }

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja apagar este GCM?")) {
      startTransition(async () => {
        try {
          await eliminarGCM(id)
          toast.success("GCM removido com sucesso!")
        } catch {
          toast.error("Erro ao remover GCM.")
        }
      })
    }
  }

  const handleStatus = (id: string, statusAtual: string) => {
    const novoStatus = statusAtual === "ATIVO" ? "INATIVO" : "ATIVO"
    startTransition(async () => {
      try {
        await alterarStatusGCM(id, novoStatus)
        toast.success(`Status alterado para ${novoStatus}!`)
      } catch {
        toast.error("Erro ao alterar status.")
      }
    })
  }

  return (
    <div className="bg-white border border-slate-200 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/80 border-b border-slate-200">
          <TableRow >
            <TableHead className="font-bold text-slate-700">
              <Button variant="ghost" onClick={() => toggleSort("matricula")} className="hover:bg-slate-200 -ml-1.5">
                Matrícula {renderSortIcon("matricula")}
              </Button>
            </TableHead>
            <TableHead className="font-bold text-slate-700">
              <Button variant="ghost" onClick={() => toggleSort("nome")} className="hover:bg-slate-200 -ml-1.5">
                Nome {renderSortIcon("nome")}
              </Button>
            </TableHead>
            <TableHead className="font-bold text-slate-700">Equipe / Cargo</TableHead>
            <TableHead className="font-bold text-slate-700">Contato</TableHead>
            <TableHead className="font-bold text-slate-700 w-[120px]">Status</TableHead>
            <TableHead className="text-right font-bold text-slate-700 w-[100px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gcms.map((gcm) => (
            <TableRow key={gcm.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => router.push(`/admin/efetivo/${gcm.id}`)}>
              <TableCell className="font-medium text-slate-600">
                {gcm.matricula}
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-900">{gcm.nome}</span>
                  {gcm.cnh === "SIM" && <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 w-fit px-1.5 py-0.5 rounded mt-1 font-semibold uppercase tracking-wider">CNH Ativa</span>}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-semibold text-slate-800">{gcm.equipe || "-"}</span>
                  <span className="text-xs text-slate-500">{gcm.role}</span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-slate-600">
                {gcm.telefone || "-"}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={gcm.status === "ATIVO" ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-100 text-slate-500 border-slate-200"}>
                  {gcm.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push(`/admin/efetivo/${gcm.id}`)}>
                      <Edit className="mr-2 h-4 w-4" /> Editar GCM
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatus(gcm.id, gcm.status)} disabled={isPending}>
                      <Power className="mr-2 h-4 w-4" /> 
                      {gcm.status === "ATIVO" ? "Inativar" : "Ativar"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleDelete(gcm.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50" disabled={isPending}>
                      <Trash className="mr-2 h-4 w-4" /> Apagar GCM
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