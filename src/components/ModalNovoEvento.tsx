// src/components/ModalNovoEvento.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, X } from "lucide-react"
import { FormEvento } from "./FormEvento"

export function ModalNovoEvento() {
  const [aberto, setAberto] = useState(false)

  return (
    <>
      {/* Botão que abre o modal */}
      <Button onClick={() => setAberto(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
        <Plus className="w-5 h-5" /> 
        Novo Evento
      </Button>

      {/* O fundo escuro e a caixa do Modal */}
      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Nova Convocação Operacional</h2>
              <button 
                onClick={() => setAberto(false)} 
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <FormEvento />
            </div>
            
          </div>
        </div>
      )}
    </>
  )
}