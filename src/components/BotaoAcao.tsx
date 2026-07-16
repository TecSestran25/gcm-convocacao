/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/BotaoAcao.tsx
"use client"

import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useTransition } from "react"

interface BotaoAcaoProps {
  action: () => Promise<void>
  label: string
  mensagemSucesso: string
  variant?: "default" | "destructive" | "outline" | "secondary"
}

export function BotaoAcao({ action, label, mensagemSucesso, variant = "default" }: BotaoAcaoProps) {
  // useTransition permite executar Server Actions no lado do cliente com estado de carregamento
  const [isPending, startTransition] = useTransition()

  const executarAcao = () => {
    startTransition(async () => {
      try {
        await action()
        toast.success(mensagemSucesso)
      } catch (error: any) {
        toast.error(error.message || "Ocorreu um erro ao processar a solicitação.")
      }
    })
  }

  return (
    <Button 
      variant={variant} 
      size="sm" 
      onClick={executarAcao} 
      disabled={isPending}
    >
      {isPending ? "Aguarde..." : label}
    </Button>
  )
}