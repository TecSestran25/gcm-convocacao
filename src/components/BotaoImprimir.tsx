// src/components/BotaoImprimir.tsx
"use client"

import { Button } from "@/components/ui/button"

export function BotaoImprimir() {
  return (
    <Button 
      onClick={() => window.print()} 
      variant="outline" 
      className="print:hidden bg-white hover:bg-slate-100"
    >
      🖨️ Imprimir / Gerar PDF
    </Button>
  )
}