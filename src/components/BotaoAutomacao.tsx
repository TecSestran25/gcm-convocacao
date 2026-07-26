// src/components/BotaoAutomacao.tsx
"use client"

import { useState } from "react"
import { convocarFilaAutomatica } from "@/app/admin/eventos/automacao-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Zap, CheckCircle2 } from "lucide-react"

interface Props {
  eventoId: string
  equipeAlvo: string
  vagasDisponiveis: number
}

export function BotaoAutomacao({ eventoId, equipeAlvo, vagasDisponiveis }: Props) {
  // Verifica se não há mais vagas
  const isEsgotado = vagasDisponiveis === 0
  
  // Se estiver esgotado, o input fica zerado, senão exibe as vagas restantes
  const [vagas, setVagas] = useState(vagasDisponiveis > 0 ? vagasDisponiveis : 0) 
  const [carregando, setCarregando] = useState(false)

  const handleConvocar = async () => {
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
    <div className={`flex flex-col sm:flex-row items-start sm:items-end gap-3 p-4 rounded-xl border transition-all ${isEsgotado ? "bg-slate-100 border-slate-200 opacity-80" : "bg-white border-slate-200"}`}>
      <div className="flex flex-col w-full sm:w-auto shrink-0">
        <label className="text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wide whitespace-nowrap">
          {isEsgotado ? "Vagas Preenchidas" : `Vagas / Equipe ${equipeAlvo}`}
        </label>
        <Input
          type="number" 
          min="1" 
          value={vagas} 
          onChange={(e) => setVagas(Number(e.target.value))}
          className="w-full sm:w-28 h-11 text-lg font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isEsgotado || carregando} // Trava o campo de texto
        />
      </div>
      
      <Button 
        onClick={handleConvocar} 
        disabled={isEsgotado || carregando} // Trava o botão
        variant={isEsgotado ? "secondary" : "default"}
        className={`w-full sm:w-auto sm:ml-auto h-11 font-bold ${!isEsgotado && "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20"}`}
      >
        {isEsgotado ? (
          <>
            <CheckCircle2 className="w-5 h-5 mr-2 text-green-600" />
            Escala Fechada
          </>
        ) : (
          <>
            <Zap className="w-5 h-5 mr-2" />
            {carregando ? "Convocando..." : "Convocar Fila"}
          </>
        )}
      </Button>
      
    </div>
  )
}