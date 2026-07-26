// src/components/FormEvento.tsx
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { criarEvento } from "@/app/admin/eventos/actions"

export function FormEvento() {
  return (
    <form action={criarEvento} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Data do Serviço</label>
          <Input name="dataServico" type="date" required className="h-11" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Horário</label>
          <Input name="horario" required placeholder="Ex: 08:00 - 20:00" className="h-11" />
        </div>
      </div>
      
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Local ou Missão</label>
        <Input name="local" required placeholder="Ex: PATRULHAMENTO PREVENTIVO" className="h-11" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Quantidade de Vagas</label>
          <Input name="vagas" type="number" min="1" required placeholder="Ex: 4" className="h-11" />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Equipe Alvo</label>
          <Input name="equipePrioritaria" required placeholder="Ex: ALFA" className="h-11 uppercase" />
        </div>
      </div>
      
      <div className="pt-2">
        <Button type="submit" className="w-full h-12 text-md font-bold bg-blue-600 hover:bg-blue-700">
          Publicar Convocação
        </Button>
      </div>
    </form>
  )
}