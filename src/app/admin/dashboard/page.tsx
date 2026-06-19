// src/app/admin/dashboard/page.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Painel de Controle</h1>
        <p className="text-slate-500 mt-1">Gestão de convocações operacionais e efetivo (GECP).</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cartão 1: Gestão de Efetivo */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Gestão de Efetivo</CardTitle>
            <CardDescription>
              Cadastre, edite e acompanhe os Guardas Municipais, além de visualizar o limite da GECP.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/efetivo">
              <Button className="w-full">
                Acessar Efetivo
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Cartão 2: Gestão de Eventos/Convocações */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Eventos e Convocações</CardTitle>
            <CardDescription>
              Crie novas convocações, gerencie vagas e acompanhe as respostas (Aceite/Recusa) em tempo real.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/eventos">
              <Button className="w-full" variant="secondary">
                Acessar Eventos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}