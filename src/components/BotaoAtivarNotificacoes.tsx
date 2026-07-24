/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/set-state-in-effect */
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { salvarInscricaoPush } from "@/app/actions/push-actions"

export function BotaoAtivarNotificacoes() {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      checkSubscription()
    }
  }, [])

  async function checkSubscription() {
    const registration = await navigator.serviceWorker.register('/sw.js')
    const subscription = await registration.pushManager.getSubscription()
    setIsSubscribed(!!subscription)
  }

  // Função padrão para converter a chave VAPID
  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  async function subscribe() {
    setLoading(true)
    try {
      // 1. Registra o Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js')
      
      // 2. Pede permissão ao usuário (O navegador vai abrir aquele popup de "Permitir Notificações")
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
      const convertedVapidKey = urlBase64ToUint8Array(publicVapidKey)

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      })

      // 3. Salva no banco de dados
      await salvarInscricaoPush(JSON.parse(JSON.stringify(subscription)))
      setIsSubscribed(true)
      alert("✅ Notificações ativadas! Você será avisado quando houver novas convocações.")
    } catch (error) {
      console.error("Erro ao assinar notificações:", error)
      alert("Não foi possível ativar as notificações. Verifique se o seu navegador permite.")
    } finally {
      setLoading(false)
    }
  }

  // Se o navegador não suporta ou o cara já ativou, esconde o botão
  if (!isSupported || isSubscribed) return null

  return (
    <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h4 className="font-bold text-blue-900">Fique Atualizado</h4>
        <p className="text-sm text-blue-700">Ative as notificações para ser avisado imediatamente quando houver uma nova escala para você.</p>
      </div>
      <Button onClick={subscribe} disabled={loading} className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap">
        {loading ? "Ativando..." : "🔔 Ativar Notificações"}
      </Button>
    </div>
  )
}