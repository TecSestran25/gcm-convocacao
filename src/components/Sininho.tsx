// src/components/Sininho.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@supabase/supabase-js"
import { Bell, CheckCircle2, XCircle, Info } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { buscarHistoricoNotificacoes, marcarTodasComoLidas } from "./notificacoes-actions"

// Tipagem da Notificação
type Notificacao = {
  id: string
  titulo: string
  mensagem: string
  tipo: string
  lida: boolean
  createdAt: Date
}

export function Sininho() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [menuAberto, setMenuAberto] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Conta quantas não foram lidas para acender a bolinha
  const naoLidas = notificacoes.filter(n => !n.lida).length

  // Carrega o histórico assim que o componente aparece na tela
  useEffect(() => {
    buscarHistoricoNotificacoes().then(dados => setNotificacoes(dados))
  }, [])

  // Conexão em Tempo Real com o Supabase
  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    const channel = supabase
      .channel('realtime-notificacoes')
      .on('postgres_changes', {
        event: 'INSERT', 
        schema: 'public',
        table: 'Notificacao' // Atenção ao 'N' maiúsculo
      }, (payload) => {
        
        const novaNotificacao = payload.new as Notificacao

        if (novaNotificacao.tipo === "SUCESSO") {
          toast.success(novaNotificacao.titulo, { description: novaNotificacao.mensagem })
        } else if (novaNotificacao.tipo === "AVISO") {
          toast.warning(novaNotificacao.titulo, { description: novaNotificacao.mensagem }) 
        } else if (novaNotificacao.tipo === "ERRO") {
          toast.error(novaNotificacao.titulo, { description: novaNotificacao.mensagem })
        } else {
          toast.info(novaNotificacao.titulo, { description: novaNotificacao.mensagem })
        }

        setNotificacoes((antigas) => [novaNotificacao, ...antigas])
      })
      .subscribe((status, err) => {
        console.log("📡 STATUS DA CONEXÃO DA NOTIFICAÇÃO:", status) // <--- LOG AQUI
        if (err) console.error("❌ ERRO NO SINO:", err)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Fecha o menu se clicar fora dele
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuAberto(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleMarcarLidas = async () => {
    await marcarTodasComoLidas()
    setNotificacoes(notificacoes.map(n => ({ ...n, lida: true })))
  }

  // Define o ícone com base no tipo de notificação
  const getIcone = (tipo: string) => {
    if (tipo === 'SUCESSO') return <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
    if (tipo === 'ERRO') return <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
    if (tipo === 'AVISO') return <Info className="h-4 w-4 text-yellow-500 mt-0.5" />
    return <Info className="h-4 w-4 text-blue-500 mt-0.5" />
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative hover:bg-slate-800"
        onClick={() => setMenuAberto(!menuAberto)}
      >
        <Bell className="h-5 w-5 text-slate-300 hover:text-white transition-colors" />
        
        {naoLidas > 0 && (
          <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-slate-900"></span>
          </span>
        )}
      </Button>

      {/* MENU DROPDOWN DE HISTÓRICO */}
      {menuAberto && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-slate-200">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-800">
              Notificações {naoLidas > 0 && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-xs ml-1">{naoLidas} novas</span>}
            </h3>
            {naoLidas > 0 && (
              <button onClick={handleMarcarLidas} className="text-xs text-blue-600 hover:underline font-medium">
                Marcar todas lidas
              </button>
            )}
          </div>
          
          <div className="max-h-[400px] overflow-y-auto">
            {notificacoes.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                Nenhuma notificação no momento.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notificacoes.map((notif) => (
                  <div key={notif.id} className={`p-4 flex gap-3 ${!notif.lida ? 'bg-blue-50/50' : 'bg-white'}`}>
                    {getIcone(notif.tipo)}
                    <div className="flex-1 space-y-1">
                      <p className={`text-sm ${!notif.lida ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {notif.titulo}
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {notif.mensagem}
                      </p>
                      <p className="text-[10px] font-medium text-slate-400 uppercase pt-1">
                        {new Date(notif.createdAt).toLocaleDateString('pt-BR')} às {new Date(notif.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}