// src/components/Sidebar.tsx
import Link from "next/link"
import { LayoutDashboard, CalendarDays, Users, BarChart3, LogOut } from "lucide-react"

export function Sidebar() {
  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col">
      <nav className="flex-1 space-y-2">
        <Link href="/admin/dashboard" className="flex items-center gap-3 p-3 rounded hover:bg-slate-800">
          <LayoutDashboard className="w-5 h-5" /> Dashboard
        </Link>
        <Link href="/admin/eventos" className="flex items-center gap-3 p-3 rounded hover:bg-slate-800">
          <CalendarDays className="w-5 h-5" /> Eventos (GECP)
        </Link>
        <Link href="/admin/efetivo" className="flex items-center gap-3 p-3 rounded hover:bg-slate-800">
          <Users className="w-5 h-5" /> Gestão de Efetivo
        </Link>
        <Link href="/admin/relatorios" className="flex items-center gap-3 p-3 rounded hover:bg-slate-800">
          <BarChart3 className="w-5 h-5" /> Relatórios
        </Link>
      </nav>

      <div className="border-t border-slate-700 pt-4">
        <button className="flex items-center gap-3 p-3 text-red-400 hover:text-red-300 w-full">
          <LogOut className="w-5 h-5" /> Sair
        </button>
      </div>
    </div>
  )
}