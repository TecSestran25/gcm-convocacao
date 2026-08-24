// src/components/BotaoPresenca.tsx
"use client"

import { registrarPresenca } from "@/app/admin/eventos/presenca-actions"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { toast } from "sonner"

interface Props {
  eventoId: string
  gcmId: string
  statusAtual: string
}

export function BotaoPresenca({ eventoId, gcmId, statusAtual }: Props) {
  const handleAtualizar = async (novoStatus: "CONFIRMADO" | "AUSENTE") => {
    try {
      await registrarPresenca(eventoId, gcmId, novoStatus)
      if (novoStatus === "CONFIRMADO") {
        toast.success("Presença confirmada com sucesso!")
      } else {
        toast.warning("Falta registrada no sistema.")
      }
    } catch (error) {
      toast.error("Erro ao registrar presença.")
    }
  }

  // Já homologado na escala oficial (aguardando check-in do Líder/Supervisor no dia do evento)
  if (statusAtual === "CONFIRMADO") {
    return (
      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
        <Check className="w-3 h-3" /> PRESENÇA CONFIRMADA
      </span>
    )
  }

  // Check-in do dia do evento já validou a presença
  if (statusAtual === "PRESENTE") {
    return (
      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded-full">
        <Check className="w-3 h-3" /> PRESENÇA VALIDADA
      </span>
    )
  }

  // Faltou (seja marcado pelo Comando na homologação, seja pelo Líder no check-in)
  if (statusAtual === "AUSENTE") {
    return (
      <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full">
        <X className="w-3 h-3" /> FALTOU AO SERVIÇO
      </span>
    )
  }

  // Se ainda estiver apenas "ACEITO", mostra as ações de Comando (Validar Presença ou Dar Falta)
  if (statusAtual === "ACEITO") {
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="text-green-600 border-green-200 hover:bg-green-50 h-8"
          onClick={() => handleAtualizar("CONFIRMADO")}
        >
          <Check className="w-4 h-4 mr-1" /> Presente
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="text-red-600 border-red-200 hover:bg-red-50 h-8"
          onClick={() => handleAtualizar("AUSENTE")}
        >
          <X className="w-4 h-4 mr-1" /> Faltou
        </Button>
      </div>
    )
  }

  // Retorna vazio se estiver Pendente ou Recusado (pois não há como dar presença)
  return null
}