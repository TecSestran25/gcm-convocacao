"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ClipboardList, Clock, LogOut, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export function MenuGcm() {
  const [aberto, setAberto] = useState(false)
  const pathname = usePathname()

  const fechar = () => setAberto(false)

  return (
    <>
      {/* Botão Hambúrguer flutuante no topo ESQUERDO */}
      <button 
        onClick={() => setAberto(true)}
        className="fixed top-6 left-6 z-40 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white transition-all"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Fundo escuro (Overlay) */}
      {aberto && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 transition-opacity"
          onClick={fechar}
        />
      )}

      {/* Menu Lateral (Drawer) na ESQUERDA */}
      <div className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${aberto ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="bg-slate-900 p-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Shield className="w-6 h-6 text-blue-400" />
            <span className="font-bold text-lg">Menu Operacional</span>
          </div>
          <button onClick={fechar} className="text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-2">
          <Link href="/gcm/convocacoes" onClick={fechar}>
            <Button variant={pathname === "/gcm/convocacoes" ? "default" : "ghost"} className={`w-full justify-start gap-3 h-12 text-md ${pathname === "/gcm/convocacoes" ? "bg-blue-600 text-white" : "text-slate-600"}`}>
              <ClipboardList className="w-5 h-5" />
              Missões Ativas
            </Button>
          </Link>
          
          <Link href="/gcm/historico" onClick={fechar}>
            <Button variant={pathname === "/gcm/historico" ? "default" : "ghost"} className={`w-full justify-start gap-3 h-12 text-md ${pathname === "/gcm/historico" ? "bg-blue-600 text-white" : "text-slate-600"}`}>
              <Clock className="w-5 h-5" />
              Histórico de Escalas
            </Button>
          </Link>

          <div className="border-t border-slate-200 my-4"></div>

          {/* Botão de Sair que aponta para a api do NextAuth */}
          <Link href="/api/auth/signout" onClick={fechar}>
            <Button variant="ghost" className="w-full justify-start gap-3 h-12 text-md text-red-600 hover:bg-red-50 hover:text-red-700">
              <LogOut className="w-5 h-5" />
              Sair do Sistema
            </Button>
          </Link>
        </div>
      </div>
    </>
  )
}