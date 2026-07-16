// src/app/admin/efetivo/[id]/page.tsx
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { atualizarGCM } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default async function EditarGcmPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  
  // Busca o guarda atual
  const gcm = await prisma.usuario.findUnique({
    where: { id: resolvedParams.id }
  })

  if (!gcm) redirect("/admin/efetivo")

  return (
    <div className="space-y-6 max-w-xl mx-auto bg-white p-6 rounded-md border border-slate-200 shadow-sm">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Editar Cadastro de GCM</h1>
        <p className="text-sm text-slate-500 mt-1">Altere os dados do guarda ou redefina a senha.</p>
      </div>

      {/* Action passa o ID usando o bind para sabermos quem atualizar */}
      <form action={atualizarGCM.bind(null, gcm.id)} className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Nome Completo</label>
          <Input name="nome" defaultValue={gcm.nome} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Matrícula</label>
            <Input name="matricula" defaultValue={gcm.matricula} required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Equipe</label>
            <Input name="equipe" defaultValue={gcm.equipe || ""} required />
          </div>
        </div>

        <div className="space-y-1 border-t pt-4 border-slate-100">
          <label className="text-sm font-medium text-slate-700">Nova Senha (Opcional)</label>
          <Input name="novaSenha" type="password" placeholder="Deixe em branco para não alterar" />
          <p className="text-xs text-slate-400">Preencha este campo apenas se o guarda esqueceu a senha e precisar resetar.</p>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Link href="/admin/efetivo">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit">Salvar Alterações</Button>
        </div>
      </form>
    </div>
  )
}