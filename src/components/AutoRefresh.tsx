"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function AutoRefresh({ interval = 10000 }: { interval?: number }) {
  const router = useRouter()

  useEffect(() => {
    // Cria um temporizador que roda a cada 'interval' milissegundos
    const timer = setInterval(() => {
      // O router.refresh() busca os dados novos no banco sem piscar a tela
      router.refresh()
    }, interval)

    // Limpa o temporizador se o usuário sair da página
    return () => clearInterval(timer)
  }, [router, interval])

  // O componente não renderiza nada visualmente
  return null
}