// src/components/BotaoCheckin.tsx
"use client"

import { useState } from "react"
import { registrarCheckin } from "@/app/gcm/checkin/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Check } from "lucide-react"

type StatusCheckin = "PRESENTE" | "AUSENTE" | "ATRASADO" | "ATESTADO" | "TROCA"

interface Props {
  eventoId: string
  gcmId: string
  statusAtual: string
  observacaoAtual?: string | null
}

const ROTULOS: Record<StatusCheckin, string> = {
  PRESENTE: "Presente",
  AUSENTE: "Faltou",
  ATRASADO: "Atrasado",
  ATESTADO: "Atestado",
  TROCA: "Troca de Última Hora",
}

const BADGE_CLASSNAME: Record<string, string> = {
  PRESENTE: "bg-emerald-100 text-emerald-700",
  AUSENTE: "bg-red-100 text-red-700",
  ATRASADO: "bg-amber-100 text-amber-700",
  ATESTADO: "bg-slate-200 text-slate-700",
  TROCA: "bg-purple-100 text-purple-700",
}

export function BotaoCheckin({ eventoId, gcmId, statusAtual, observacaoAtual }: Props) {
  const [status, setStatus] = useState<StatusCheckin>(
    (["PRESENTE", "AUSENTE", "ATRASADO", "ATESTADO", "TROCA"].includes(statusAtual) ? statusAtual : "PRESENTE") as StatusCheckin
  )
  const [observacao, setObservacao] = useState("")
  const [carregando, setCarregando] = useState(false)

  const jaValidado = statusAtual !== "CONFIRMADO"

  const handleConfirmar = async () => {
    setCarregando(true)
    try {
      await registrarCheckin(eventoId, gcmId, status, observacao)
      toast.success(status === "AUSENTE" ? "Falta registrada no sistema." : "Check-in registrado com sucesso!")
      setObservacao("")
    } catch {
      toast.error("Erro ao registrar o check-in.")
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
      {jaValidado && (
        <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${BADGE_CLASSNAME[statusAtual] ?? "bg-slate-100 text-slate-600"}`}>
          <Check className="w-3 h-3" /> {ROTULOS[statusAtual as StatusCheckin] ?? statusAtual}
        </span>
      )}
      {observacaoAtual && (
        <span className="text-xs text-slate-500 italic max-w-xs text-right">&quot;{observacaoAtual}&quot;</span>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as StatusCheckin)}
          disabled={carregando}
          className="h-9 rounded-md border border-input bg-white px-2 text-sm"
        >
          {(Object.keys(ROTULOS) as StatusCheckin[]).map((s) => (
            <option key={s} value={s}>{ROTULOS[s]}</option>
          ))}
        </select>
        <Input
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          placeholder="Observação (opcional)"
          disabled={carregando}
          className="h-9 text-sm w-full sm:w-48"
        />
        <Button size="sm" onClick={handleConfirmar} disabled={carregando} className="h-9 bg-blue-600 hover:bg-blue-700">
          {carregando ? "Salvando..." : jaValidado ? "Alterar" : "Confirmar"}
        </Button>
      </div>
    </div>
  )
}
