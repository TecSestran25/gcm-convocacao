// src/components/BotaoCheckin.tsx
"use client"

import { registrarCheckin } from "@/app/gcm/checkin/actions"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"
import { toast } from "sonner"

interface Props {
  eventoId: string
  gcmId: string
  statusAtual: string
}

export function BotaoCheckin({ eventoId, gcmId, statusAtual }: Props) {
  const handleAtualizar = async (novoStatus: "PRESENTE" | "AUSENTE") => {
    try {
      await registrarCheckin(eventoId, gcmId, novoStatus)
      if (novoStatus === "PRESENTE") {
        toast.success("Presença validada com sucesso!")
      } else {
        toast.warning("Falta registrada no sistema.")
      }
    } catch {
      toast.error("Erro ao registrar o check-in.")
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant={statusAtual === "PRESENTE" ? "default" : "outline"}
        className={statusAtual === "PRESENTE" ? "bg-emerald-600 hover:bg-emerald-700 h-8" : "text-emerald-600 border-emerald-200 hover:bg-emerald-50 h-8"}
        onClick={() => handleAtualizar("PRESENTE")}
      >
        <Check className="w-4 h-4 mr-1" /> Presente
      </Button>

      <Button
        size="sm"
        variant={statusAtual === "AUSENTE" ? "default" : "outline"}
        className={statusAtual === "AUSENTE" ? "bg-red-600 hover:bg-red-700 h-8" : "text-red-600 border-red-200 hover:bg-red-50 h-8"}
        onClick={() => handleAtualizar("AUSENTE")}
      >
        <X className="w-4 h-4 mr-1" /> Faltou
      </Button>
    </div>
  )
}
