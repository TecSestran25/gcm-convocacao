"use client"

import { usePathname, useSearchParams } from "next/navigation"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export function Paginacao({ totalPaginas }: { totalPaginas: number }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const paginaAtual = Number(searchParams.get("page")) || 1

  const criarLinkPagina = (numeroPagina: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", numeroPagina.toString())
    return `${pathname}?${params.toString()}`
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            href={paginaAtual > 1 ? criarLinkPagina(paginaAtual - 1) : "#"} 
            className={paginaAtual <= 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
        
        {Array.from({ length: totalPaginas }).map((_, i) => {
          const pagina = i + 1
          return (
            <PaginationItem key={pagina}>
              <PaginationLink 
                href={criarLinkPagina(pagina)} 
                isActive={paginaAtual === pagina}
              >
                {pagina}
              </PaginationLink>
            </PaginationItem>
          )
        })}

        <PaginationItem>
          <PaginationNext 
            href={paginaAtual < totalPaginas ? criarLinkPagina(paginaAtual + 1) : "#"} 
            className={paginaAtual >= totalPaginas ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}