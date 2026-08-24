// src/components/FormEvento.tsx
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { criarEvento } from "@/app/admin/eventos/actions"

interface Lider {
  id: string
  nome: string
  matricula: string
}

interface Props {
  equipes: string[]
  lideres: Lider[]
}

export function FormEvento({ equipes, lideres }: Props) {
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
          <Input name="equipePrioritaria" required placeholder="Ex: ALPHA" className="h-11 uppercase" />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700">Tempo limite para resposta (minutos)</label>
        <Input name="slaMinutos" type="number" min="1" placeholder="Ex: 60 (deixe em branco para não expirar)" className="h-11" />
      </div>

      {/* Sequência de escalonamento: para onde a convocação avança se a Equipe Alvo esgotar */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-sm font-medium text-slate-700">Sequência de Escalonamento (opcional)</label>
        <p className="text-xs text-slate-500">Se a Equipe Alvo não preencher as vagas a tempo, o sistema tenta nesta ordem.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((posicao) => (
            <select key={posicao} name={`escalonamento${posicao}`} defaultValue="" className="h-11 rounded-md border border-input bg-white px-3 text-sm">
              <option value="">{posicao}ª equipe seguinte...</option>
              {equipes.map((equipe) => (
                <option key={equipe} value={equipe}>{equipe}</option>
              ))}
            </select>
          ))}
        </div>
      </div>

      {/* Delegação de validação: obrigatório indicar quem pode fazer o check-in deste evento */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-sm font-medium text-slate-700">Líderes/Supervisores autorizados a validar presença</label>
        <p className="text-xs text-slate-500">Selecione ao menos um. Só eles poderão fazer o check-in (Presente/Faltou) deste evento.</p>
        {lideres.length === 0 ? (
          <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3">
            Nenhum usuário com papel Líder ou Supervisor cadastrado ainda.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-slate-200 rounded-md p-3">
            {lideres.map((lider) => (
              <label key={lider.id} className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" name="validadores" value={lider.id} required={false} className="rounded border-slate-300" />
                {lider.nome} <span className="text-slate-400">({lider.matricula})</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="pt-2">
        <Button type="submit" className="w-full h-12 text-md font-bold bg-blue-600 hover:bg-blue-700">
          Publicar Convocação
        </Button>
      </div>
    </form>
  )
}
