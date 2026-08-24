// src/app/admin/eventos/novo/page.tsx
import { FormEvento } from "@/components/FormEvento"
import { buscarDadosFormularioEvento } from "@/lib/dados-formulario-evento"
import { ArrowLeft, ShieldAlert } from "lucide-react"
import Link from "next/link"

export default async function NovoEventoMobilePage() {
  const { equipes, lideres } = await buscarDadosFormularioEvento()

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 pb-12">
      
      {/* Cabeçalho estilo App */}
      <div className="bg-slate-900 text-white p-4 flex items-center gap-4 rounded-b-3xl shadow-md mb-8">
        <Link href="/admin/eventos" className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-blue-400" />
          <h1 className="text-lg font-bold">Nova Convocação</h1>
        </div>
      </div>

      {/* Corpo do formulário */}
      <div className="px-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <FormEvento equipes={equipes} lideres={lideres} />
        </div>
      </div>
      
    </div>
  )
}