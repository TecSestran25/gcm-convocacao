// src/components/AdminShell.tsx
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, CalendarPlus, FileText, Menu, X, Shield, LogOut, Users } from "lucide-react"

export function AdminShell({ children }: { children: React.ReactNode }) {
  // Agora temos apenas UM estado para o menu (Mobile e PC), começando fechado.
  const [menuAberto, setMenuAberto] = useState(false)
  const pathname = usePathname()

  const fecharMenu = () => setMenuAberto(false)

  // Suas rotas do painel
  const rotas = [
    { nome: "Dashboard", caminho: "/admin/dashboard", icone: LayoutDashboard },
    { nome: "Missões e Eventos", caminho: "/admin/eventos", icone: CalendarPlus },
    { nome: "Relatórios", caminho: "/admin/relatorios", icone: FileText },
    { nome: "Efetivo GCM", caminho: "/admin/efetivo", icone: Users }, 
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Cabeçalho Fixo (Apenas Mobile) */}
      <div className="lg:hidden bg-slate-900 text-white flex items-center p-4 sticky top-0 z-30 shadow-md gap-4">
        <button onClick={() => setMenuAberto(true)} className="p-1 text-slate-300 hover:text-white">
          <Menu className="w-7 h-7" />
        </button>
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-blue-400" />
          <span className="font-bold tracking-wide">Comando GCM</span>
        </div>
      </div>

      {/* Botão Flutuante (Apenas Desktop) */}
      <div className={`hidden lg:block fixed top-6 left-6 z-30 transition-opacity duration-300 ${menuAberto ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
        <button onClick={() => setMenuAberto(true)} className="p-3 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition-all">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Overlay Escuro (Fundo borrado para Mobile e Desktop) */}
      {menuAberto && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={fecharMenu}
        />
      )}

      {/* ========================================================= */}
      {/* SIDEBAR (Agora sempre sobrepõe o conteúdo)                  */}
      {/* ========================================================= */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out ${menuAberto ? "translate-x-0" : "-translate-x-full"}`}>
        
        {/* Cabeçalho da Sidebar */}
        <div className="h-20 flex items-center justify-between px-6 bg-slate-950/50 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">COMANDO</h2>
              <p className="text-[10px] uppercase tracking-widest text-slate-400">GCM Goiana</p>
            </div>
          </div>
          {/* Botão de fechar */}
          <button 
            onClick={fecharMenu} 
            className="text-slate-400 hover:text-white bg-slate-800/50 p-1.5 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links de Navegação */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 mt-2">Menu Principal</p>
          
          {rotas.map((rota) => {
            const ativo = pathname.startsWith(rota.caminho)
            const Icone = rota.icone

            return (
              <Link key={rota.caminho} href={rota.caminho} onClick={fecharMenu} className="block">
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  ativo 
                  ? "bg-blue-600 text-white shadow-md shadow-blue-900/20" 
                  : "hover:bg-slate-800 hover:text-white"
                }`}>
                  <Icone className={`w-5 h-5 ${ativo ? "text-white" : "text-slate-400"}`} />
                  <span className="font-medium">{rota.nome}</span>
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Rodapé da Sidebar */}
        <div className="p-4 border-t border-slate-800">
          <Link href="/api/auth/signout" className="block">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Sair do Sistema</span>
            </div>
          </Link>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* CONTEÚDO PRINCIPAL (Agora 100% da largura, sem espremer)  */}
      {/* ========================================================= */}
      <main className="flex-1 min-w-0 w-full relative">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>

    </div>
  )
}