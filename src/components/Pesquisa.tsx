// src/components/Pesquisa.tsx
"use client"

import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function Pesquisa({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  function handleSearch(formData: FormData) {
    const termo = formData.get("termo")?.toString()
    const params = new URLSearchParams(searchParams)
    
    if (termo) {
      params.set("q", termo)
    } else {
      params.delete("q")
    }
    
    // Atualiza a URL sem recarregar a página inteira
    replace(`${pathname}?${params.toString()}`)
  }

  return (
    <form action={handleSearch} className="flex flex-1 max-w-sm items-center gap-2">
      <Input
        name="termo"
        type="text"
        placeholder={placeholder}
        defaultValue={searchParams.get("q")?.toString()}
      />
      <Button type="submit" variant="secondary">Buscar</Button>
    </form>
  )
}