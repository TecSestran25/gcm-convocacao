/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/TabelaEquipes.tsx
"use client"

export function TabelaEquipes({ relatorioEquipes }: { relatorioEquipes: any[] }) {
  return (
    <div className="flex flex-col h-full">
      
      {/* ========================================== */}
      {/* VISÃO DESKTOP (Tabela)                     */}
      {/* ========================================== */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100/50 text-slate-600 uppercase text-[10px] font-semibold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">Equipe</th>
              <th className="px-2 py-3 text-center">GCMs</th>
              <th className="px-2 py-3 text-center">Serviços</th>
              <th className="px-2 py-3 text-center">Horas</th>
              <th className="px-4 py-3 text-right">Índice Part.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {relatorioEquipes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">Nenhuma equipe com dados.</td>
              </tr>
            ) : (
              relatorioEquipes.map((eq) => (
                <tr key={eq.equipe} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-bold text-slate-800">{eq.equipe}</td>
                  <td className="px-2 py-3 text-center text-slate-600">{eq.totalGcms}</td>
                  <td className="px-2 py-3 text-center font-medium text-slate-900">{eq.totalServicos}</td>
                  <td className="px-2 py-3 text-center text-slate-600">{eq.horasTotais}h</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-flex items-center justify-center px-2 py-1 rounded font-bold text-xs ${
                      eq.indiceParticipacao >= 70 ? "bg-green-100 text-green-700" :
                      eq.indiceParticipacao >= 40 ? "bg-orange-100 text-orange-700" : 
                      "bg-red-100 text-red-700"
                    }`}>
                      {eq.indiceParticipacao}%
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ========================================== */}
      {/* VISÃO MOBILE (Cards)                       */}
      {/* ========================================== */}
      <div className="md:hidden flex flex-col gap-3 p-4 bg-slate-50/50">
        {relatorioEquipes.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">Nenhuma equipe com dados.</div>
        ) : (
          relatorioEquipes.map((eq) => (
            <div key={eq.equipe} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
              
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-900 text-lg">{eq.equipe}</span>
                <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-md font-bold text-xs border ${
                  eq.indiceParticipacao >= 70 ? "bg-green-50 text-green-700 border-green-200" :
                  eq.indiceParticipacao >= 40 ? "bg-orange-50 text-orange-700 border-orange-200" : 
                  "bg-red-50 text-red-700 border-red-200"
                }`}>
                  Índice: {eq.indiceParticipacao}%
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold mb-1">GCMs</span>
                  <span className="font-bold text-slate-700">{eq.totalGcms}</span>
                </div>
                <div className="flex flex-col items-center justify-center border-l border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Serviços</span>
                  <span className="font-bold text-slate-900">{eq.totalServicos}</span>
                </div>
                <div className="flex flex-col items-center justify-center border-l border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Horas</span>
                  <span className="font-bold text-slate-600">{eq.horasTotais}h</span>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  )
}