// src/components/BotaoEscalonar.tsx
"use client"

import { useState } from "react"
import { convocarFilaAutomatica } from "@/app/admin/eventos/automacao-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { TrendingUp } from "lucide-react"

interface Props {
  eventoId: string
  vagasDisponiveis: number
  equipesDisponiveis: string[]
}

export function BotaoEscalonar({ eventoId, vagasDisponiveis, equipesDisponiveis }: Props) {
  const [equipeAlvo, setEquipeAlvo] = useState(equipesDisponiveis[0] ?? "")
  const [vagas, setVagas] = useState(vagasDisponiveis)
  const [carregando, setCarregando] = useState(false)

  if (equipesDisponiveis.length === 0) return null

  const handleEscalonar = async () => {
    if (!equipeAlvo) return toast.error("Selecione a equipe para escalonar.")
    if (vagas <= 0) return toast.error("A quantidade de vagas deve ser maior que zero.")

    setCarregando(true)
    const resposta = await convocarFilaAutomatica(eventoId, equipeAlvo, vagas)
    setCarregando(false)

    if (resposta.erro) {
      toast.error(resposta.erro)
    } else {
      toast.success(resposta.mensagem)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50">
      <div className="flex flex-col w-full sm:w-auto shrink-0">
        <label className="text-xs font-bold text-amber-700 mb-1.5 uppercase tracking-wide whitespace-nowrap">
          Próxima Equipe
        </label>
        <select
          value={equipeAlvo}
          onChange={(e) => setEquipeAlvo(e.target.value)}
          disabled={carregando}
          className="h-11 w-full sm:w-40 rounded-md border border-input bg-white px-3 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {equipesDisponiveis.map((equipe) => (
            <option key={equipe} value={equipe}>{equipe}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col w-full sm:w-auto shrink-0">
        <label className="text-xs font-bold text-amber-700 mb-1.5 uppercase tracking-wide whitespace-nowrap">
          Vagas
        </label>
        <Input
          type="number"
          min="1"
          value={vagas}
          onChange={(e) => setVagas(Number(e.target.value))}
          className="w-full sm:w-24 h-11 text-lg font-bold text-slate-700"
          disabled={carregando}
        />
      </div>

      <Button
        onClick={handleEscalonar}
        disabled={carregando}
        className="w-full sm:w-auto sm:ml-auto h-11 font-bold bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/20"
      >
        <TrendingUp className="w-5 h-5 mr-2" />
        {carregando ? "Escalonando..." : "Escalonar para Próxima Equipe"}
      </Button>
    </div>
  )
}
