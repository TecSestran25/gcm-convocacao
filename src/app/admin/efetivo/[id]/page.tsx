// src/app/admin/efetivo/[id]/page.tsx
import { prisma } from "@/lib/prisma"
import { atualizarGCM } from "../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function EditarEfetivoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const id = resolvedParams.id

  // Busca os dados atuais do Guarda no banco
  const gcm = await prisma.usuario.findUnique({
    where: { id }
  })

  // Se o ID não existir, mostra a página de 404
  if (!gcm) {
    notFound()
  }

  // Prepara a action passando o ID fixo como primeiro parâmetro
  const atualizarGCMComId = atualizarGCM.bind(null, gcm.id)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editar Servidor</h1>
          <p className="text-slate-500">Atualize as informações operacionais de {gcm.nome}</p>
        </div>
        <Link href="/admin/efetivo">
          <Button variant="outline">Voltar para Lista</Button>
        </Link>
      </div>

      <div className="bg-white p-6 rounded-md border border-slate-200 shadow-sm">
        <form action={atualizarGCMComId} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* INFORMAÇÕES PRINCIPAIS */}
            <div className="space-y-4 md:col-span-2 border-b border-slate-100 pb-4">
              <h3 className="text-lg font-semibold text-slate-800">Dados Principais</h3>
              
              <div className="space-y-1">
                <label className="text-sm font-medium">Nome Completo</label>
                <Input name="nome" defaultValue={gcm.nome} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Matrícula</label>
                  <Input name="matricula" defaultValue={gcm.matricula} required />
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium">Equipe</label>
                  <Input name="equipe" defaultValue={gcm.equipe || ""} required />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Cargo (Role)</label>
                  <select 
                    name="role" 
                    defaultValue={gcm.role}
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                  >
                    <option value="GCM">GCM</option>
                    <option value="LIDER">LÍDER</option>
                    <option value="SUPERVISOR">SUPERVISOR</option>
                    <option value="COMANDO">COMANDO</option>
                  </select>
                </div>
              </div>
            </div>

            {/* DADOS COMPLEMENTARES */}
            <div className="space-y-4 md:col-span-2 border-b border-slate-100 pb-4">
              <h3 className="text-lg font-semibold text-slate-800">Dados Complementares</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium">Telefone</label>
                  <Input name="telefone" defaultValue={gcm.telefone || ""} placeholder="(81) 99999-9999" />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium">Possui CNH?</label>
                  <select 
                    name="cnh" 
                    defaultValue={gcm.cnh || "NÃO"}
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                  >
                    <option value="SIM">SIM</option>
                    <option value="NÃO">NÃO</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Especializações</label>
                <Input name="especializacoes" defaultValue={gcm.especializacoes || ""} placeholder="Ex: ROMU, Canil, Maria da Penha..." />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Observações</label>
                <Input name="observacoes" defaultValue={gcm.observacoes || ""} placeholder="Ex: Restrição médica temporária" />
              </div>
            </div>

            {/* ÁREA DE SEGURANÇA */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-lg font-semibold text-slate-800">Segurança</h3>
              <div className="bg-orange-50 border border-orange-100 p-4 rounded-md">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-orange-900">Nova Senha (Opcional)</label>
                  <Input 
                    name="novaSenha" 
                    type="password" 
                    placeholder="Deixe em branco para manter a senha atual"
                    className="bg-white" 
                  />
                  <p className="text-xs text-orange-700 mt-1">
                    Só preencha este campo se o guarda perdeu o acesso e você precisar resetar a senha.
                  </p>
                </div>
              </div>
            </div>

          </div>
          
          <div className="flex justify-end pt-6">
            <Link href="/admin/efetivo">
              <Button type="button" variant="ghost" className="mr-4">Cancelar</Button>
            </Link>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}