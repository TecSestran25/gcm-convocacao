// src/app/admin/efetivo/page.tsx
import { prisma } from "@/lib/prisma"
import { criarGCM } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function EfetivoPage() {
  // Busca todos os guardas no banco, em ordem alfabética
  const gcms = await prisma.usuario.findMany({
    where: { role: "GCM" },
    orderBy: { nome: 'asc' }
  })

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Gestão de Efetivo</h1>
        <p className="text-slate-500">Cadastre novos Guardas Municipais.</p>
      </div>

      {/* Formulário de Cadastro (Funcional e Direto) */}
      <div className="bg-white p-4 rounded-md border border-slate-200">
        <form action={criarGCM} className="flex gap-4 items-end">
          <div className="space-y-1 flex-1">
            <label className="text-sm font-medium">Nome Completo</label>
            <Input name="nome" required placeholder="Ex: JOÃO DA SILVA" />
          </div>
          <div className="space-y-1 w-32">
            <label className="text-sm font-medium">Matrícula</label>
            <Input name="matricula" required placeholder="Ex: 12345" />
          </div>
          <div className="space-y-1 w-32">
            <label className="text-sm font-medium">Equipe</label>
            <Input name="equipe" required placeholder="Ex: ALFA" />
          </div>
          <Button type="submit">Cadastrar</Button>
        </form>
        <p className="text-xs text-slate-400 mt-2">*A senha inicial padrão para novos cadastros é <b>gcm123</b>.</p>
      </div>

      {/* Tabela de Dados */}
      <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Matrícula</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Equipe</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gcms.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-slate-500 py-4">
                  Nenhum GCM cadastrado ainda.
                </TableCell>
              </TableRow>
            )}
            {gcms.map((gcm) => (
              <TableRow key={gcm.id}>
                <TableCell className="font-medium">{gcm.matricula}</TableCell>
                <TableCell>{gcm.nome}</TableCell>
                <TableCell>{gcm.equipe || "-"}</TableCell>
                <TableCell>{gcm.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}