// src/components/ModalNovoEfetivo.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UserPlus, X } from "lucide-react"
import { FormEfetivo } from "./FormEfetivo"

export function ModalNovoEfetivo() {
  const [aberto, setAberto] = useState(false)

  return (
    <>
      <Button onClick={() => setAberto(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
        <UserPlus className="w-5 h-5" /> 
        Novo GCM
      </Button>

      {aberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 z-10 flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
              <h2 className="text-xl font-bold text-slate-800">Cadastrar Novo Guarda</h2>
              <button onClick={() => setAberto(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <FormEfetivo />
            </div>
          </div>
        </div>
      )}
    </>
  )
}