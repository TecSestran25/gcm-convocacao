// src/components/EscalarGuardasForm.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { escalarGuardas } from "@/app/admin/eventos/escalacao-actions"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { UserCheck } from "lucide-react"

interface Gcm {
  id: string
  nome: string
  matricula: string
  extrasNoMes: number
  jaConvocado: boolean
}

interface Props {
  eventoId: string
  vagasRestantes: number
  gcms: Gcm[]
}

export function EscalarGuardasForm({ eventoId, vagasRestantes, gcms }: Props) {
  const router = useRouter()
  const [selecionados, setSelecionados] = useState<string[]>([])
  const [carregando, setCarregando] = useState(false)

  const alternar = (id: string) => {
    setSelecionados((atual) => {
      if (atual.includes(id)) return atual.filter((x) => x !== id)
      if (atual.length >= vagasRestantes) {
        toast.warning(`Você só pode selecionar até ${vagasRestantes} guarda(s) para as vagas restantes.`)
        return atual
      }
      return [...atual, id]
    })
  }

  const handleEscalar = async () => {
    if (selecionados.length === 0) {
      toast.error("Selecione ao menos um guarda.")
      return
    }

    setCarregando(true)
    const resposta = await escalarGuardas(eventoId, selecionados)
    setCarregando(false)

    if (resposta.erro) {
      toast.error(resposta.erro)
    } else {
      toast.success(resposta.mensagem)
      setSelecionados([])
      router.refresh()
    }
  }

  if (gcms.length === 0) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center shadow-sm">
        <p className="text-slate-500 font-medium">Nenhum guarda elegível encontrado para esta equipe.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <h2 className="font-bold text-slate-800">Selecione os Guardas</h2>
        <span className="text-xs font-bold text-slate-500">{selecionados.length}/{vagasRestantes} selecionados</span>
      </div>

      <div className="divide-y divide-slate-100 max-h-[28rem] overflow-y-auto">
        {gcms.map((gcm) => {
          const marcado = selecionados.includes(gcm.id)
          return (
            <label
              key={gcm.id}
              className={`flex items-center justify-between gap-3 p-4 cursor-pointer transition-colors ${
                gcm.jaConvocado ? "opacity-50 cursor-not-allowed" : marcado ? "bg-blue-50" : "hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <input
                  type="checkbox"
                  checked={marcado || gcm.jaConvocado}
                  disabled={gcm.jaConvocado || carregando}
                  onChange={() => alternar(gcm.id)}
                  className="w-5 h-5 rounded border-slate-300"
                />
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">{gcm.nome}</p>
                  <p className="text-xs text-slate-500">Matrícula: {gcm.matricula}</p>
                </div>
              </div>
              <span className="shrink-0 text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full whitespace-nowrap">
                {gcm.jaConvocado ? "Já escalado" : `${gcm.extrasNoMes} extra(s) no mês`}
              </span>
            </label>
          )
        })}
      </div>

      <div className="p-4 border-t border-slate-100">
        <Button
          onClick={handleEscalar}
          disabled={carregando || selecionados.length === 0}
          className="w-full h-12 font-bold bg-blue-600 hover:bg-blue-700"
        >
          <UserCheck className="w-5 h-5 mr-2" />
          {carregando ? "Escalando..." : `Escalar ${selecionados.length || ""} Guarda(s)`}
        </Button>
      </div>
    </div>
  )
}
