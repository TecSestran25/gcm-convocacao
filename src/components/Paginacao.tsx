// src/components/Paginacao.tsx
"use client"

import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function Paginacao({ totalPaginas }: { totalPaginas: number }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { replace } = useRouter()
  
  // Lê a página atual da URL (se não existir, é a página 1)
  const paginaAtual = Number(searchParams.get("page")) || 1

  // Se só tivermos 1 página, não há necessidade de mostrar os botões
  if (totalPaginas <= 1) return null

  const irParaPagina = (numeroPagina: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", numeroPagina.toString())
    replace(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex justify-between items-center pt-4 border-t border-slate-100">
      <p className="text-sm text-slate-500">
        Página <span className="font-medium text-slate-900">{paginaAtual}</span> de <span className="font-medium text-slate-900">{totalPaginas}</span>
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => irParaPagina(paginaAtual - 1)}
          disabled={paginaAtual <= 1}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => irParaPagina(paginaAtual + 1)}
          disabled={paginaAtual >= totalPaginas}
        >
          Próxima
        </Button>
      </div>
    </div>
  )
}