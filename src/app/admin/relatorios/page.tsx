// src/app/admin/relatorios/page.tsx
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BarChart3, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function RelatoriosPage() {
  // Busca todos os usuários que são GCMs, incluindo o histórico de convocações deles
  const gcms = await prisma.usuario.findMany({
    where: { role: "GCM" },
    include: {
      convocacoes: true
    },
    orderBy: { nome: 'asc' }
  })

  // Processa os dados para gerar a tabela
  const relatorio = gcms.map(gcm => {
    const totalMissoes = gcm.convocacoes.length
    const confirmados = gcm.convocacoes.filter(c => c.status === "CONFIRMADO").length
    const faltas = gcm.convocacoes.filter(c => c.status === ("FALTOU" as typeof c.status)).length
    const recusados = gcm.convocacoes.filter(c => c.status === "RECUSADO").length
    const pendentes = gcm.convocacoes.filter(c => c.status === "PENDENTE" || c.status === "ACEITO").length

    return { ...gcm, totalMissoes, confirmados, faltas, recusados, pendentes }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Relatórios Operacionais</h1>
        <p className="text-slate-500">Histórico de produtividade e engajamento do efetivo.</p>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-slate-200">
          <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Produtividade Individual
          </CardTitle>
          <CardDescription>Resumo de serviços extraordinários por Guarda.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100/50 text-slate-600 uppercase text-xs font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">GCM / Matrícula</th>
                  <th className="px-4 py-3">Equipe</th>
                  <th className="px-4 py-3 text-center">Presenças</th>
                  <th className="px-4 py-3 text-center">Recusas</th>
                  <th className="px-4 py-3 text-center">Faltas</th>
                  <th className="px-4 py-3 text-center">Total Convocado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {relatorio.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      Nenhum dado operacional registrado.
                    </td>
                  </tr>
                ) : (
                  relatorio.map((gcm) => (
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
                      <td className="px-4 py-3 text-center font-medium text-slate-700">
                        {gcm.totalMissoes}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}