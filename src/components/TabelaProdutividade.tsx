/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/TabelaProdutividade.tsx
"use client"

import { useState } from "react"
import { CheckCircle2, Clock, XCircle, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function TabelaProdutividade({ relatorio }: { relatorio: any[] }) {
  const [pagina, setPagina] = useState(1)
  const itensPorPagina = 5

  const totalPaginas = Math.max(1, Math.ceil(relatorio.length / itensPorPagina))
  const inicio = (pagina - 1) * itensPorPagina
  const dadosPaginados = relatorio.slice(inicio, inicio + itensPorPagina)

  return (
    <div className="flex flex-col h-full">
      
      {/* ========================================== */}
      {/* VISÃO DESKTOP (Tabela)                     */}
      {/* ========================================== */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100/50 text-slate-600 uppercase text-xs font-semibold border-b border-slate-200">
            <tr>
              <th className="px-4 py-3">GCM / Matrícula</th>
              <th className="px-4 py-3">Equipe</th>
              <th className="px-4 py-3 text-center">Presenças</th>
              <th className="px-4 py-3 text-center">Horas Est.</th>
              <th className="px-4 py-3 text-center">Recusas</th>
              <th className="px-4 py-3 text-center">Faltas</th>
              <th className="px-4 py-3 text-center">Imprevistos</th>
              <th className="px-4 py-3 text-center">Em Aberto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dadosPaginados.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                  Nenhum dado operacional registrado.
                </td>
              </tr>
            ) : (
              dadosPaginados.map((gcm) => (
                <tr key={gcm.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{gcm.nome}</p>
                    <p className="text-xs text-slate-500">Mat: {gcm.matricula}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-slate-200 text-slate-800 text-xs px-2 py-1 rounded font-medium">
                      {gcm.equipe || "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 font-semibold text-green-600">
                      {gcm.confirmados > 0 && <CheckCircle2 className="w-4 h-4" />}
                      {gcm.confirmados}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-slate-700">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="w-4 h-4 text-slate-400" />
                      {gcm.horasTrabalhadas}h
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-slate-600">
                    {gcm.recusados}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {gcm.faltas > 0 ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-red-600">
                        <XCircle className="w-4 h-4" /> {gcm.faltas}
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {gcm.imprevistos > 0 ? (
                      <span className="inline-flex items-center gap-1 font-semibold text-amber-600">
                        <AlertTriangle className="w-4 h-4" /> {gcm.imprevistos}
                      </span>
                    ) : (
                      <span className="text-slate-400">0</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-500">
                    {gcm.pendentes}
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
        {dadosPaginados.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">Nenhum dado operacional.</div>
        ) : (
          dadosPaginados.map((gcm) => (
            <div key={gcm.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <h4 className="font-bold text-slate-900 leading-tight">{gcm.nome}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Mat: {gcm.matricula}</p>
                </div>
                <span className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold px-2.5 py-1 rounded-md shrink-0 border border-slate-200">
                  {gcm.equipe || "N/A"}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Presenças</span>
                  <span className="font-bold text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/>{gcm.confirmados}</span>
                </div>
                <div className="flex flex-col items-center justify-center border-l border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Horas</span>
                  <span className="font-bold text-slate-700">{gcm.horasTrabalhadas}h</span>
                </div>
                <div className="flex flex-col items-center justify-center border-l border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Faltas</span>
                  <span className={`font-bold ${gcm.faltas > 0 ? "text-red-600" : "text-slate-400"}`}>{gcm.faltas}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100">
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Recusas</span>
                  <span className="font-bold text-slate-600">{gcm.recusados}</span>
                </div>
                <div className="flex flex-col items-center justify-center border-l border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Imprev.</span>
                  <span className={`font-bold ${gcm.imprevistos > 0 ? "text-amber-600" : "text-slate-400"}`}>{gcm.imprevistos}</span>
                </div>
                <div className="flex flex-col items-center justify-center border-l border-slate-100">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Em Aberto</span>
                  <span className="font-bold text-slate-600">{gcm.pendentes}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ========================================== */}
      {/* CONTROLES DE PAGINAÇÃO                     */}
      {/* ========================================== */}
      <div className="mt-auto border-t border-slate-200 p-4 flex items-center justify-between bg-white rounded-b-xl">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setPagina(p => Math.max(1, p - 1))}
          disabled={pagina === 1}
          className="text-slate-600"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
        </Button>
        
        <span className="text-sm font-medium text-slate-500">
          Página <strong className="text-slate-900">{pagina}</strong> de {totalPaginas}
        </span>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
          disabled={pagina === totalPaginas}
          className="text-slate-600"
        >
          Próxima <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

    </div>
  )
}