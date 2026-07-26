// src/components/FormEfetivo.tsx
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { criarGCM } from "@/app/admin/efetivo/actions"

export function FormEfetivo() {
  return (
    <form action={criarGCM} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium text-slate-700">Nome Completo</label>
          <Input name="nome" required placeholder="Ex: JOÃO DA SILVA" className="h-11" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Matrícula</label>
          <Input name="matricula" required placeholder="Ex: 12345" className="h-11" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Equipe</label>
          <Input name="equipe" required placeholder="Ex: ALPHA" className="h-11 uppercase" />
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Cargo (Role)</label>
          <select name="role" className="flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950">
            <option value="GCM">GCM</option>
            <option value="LIDER">LÍDER</option>
            <option value="SUPERVISOR">SUPERVISOR</option>
            <option value="COMANDO">COMANDO</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Possui CNH?</label>
          <select name="cnh" className="flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950">
            <option value="SIM">SIM</option>
            <option value="NÃO">NÃO</option>
          </select>
        </div>
        
        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium text-slate-700">Telefone</label>
          <Input name="telefone" placeholder="(81) 99999-9999" className="h-11" />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium text-slate-700">Especializações</label>
          <Input name="especializacoes" placeholder="Ex: ROMU, Canil, Maria da Penha..." className="h-11" />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <label className="text-sm font-medium text-slate-700">Observações</label>
          <Input name="observacoes" placeholder="Ex: Restrição médica temporária" className="h-11" />
        </div>
      </div>
      <div className="pt-2">
        <Button type="submit" className="w-full h-12 text-md font-bold bg-blue-600 hover:bg-blue-700">
          Cadastrar Guarda
        </Button>
      </div>
    </form>
  )
}