// src/app/admin/eventos/[id]/editar/page.tsx
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { atualizarEvento } from "../../actions"
import { buscarDadosFormularioEvento } from "@/lib/dados-formulario-evento"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default async function EditarEventoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params

  const evento = await prisma.evento.findUnique({
    where: { id: resolvedParams.id },
    include: { validadores: { select: { id: true } } }
  })

  if (!evento) redirect("/admin/eventos")

  const { equipes, lideres } = await buscarDadosFormularioEvento()

  const validadoresAtuais = new Set(evento.validadores.map(v => v.id))

  // Formata a data para preencher o input type="date" (YYYY-MM-DD)
  const dataFormatada = evento.dataServico.toISOString().split('T')[0]

  return (
    <div className="space-y-6 max-w-xl mx-auto bg-white p-6 rounded-md border border-slate-200 shadow-sm">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Editar Convocação</h1>
        <p className="text-sm text-slate-500 mt-1">Altere as regras ou os dados da missão.</p>
      </div>

      <form action={atualizarEvento.bind(null, evento.id)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Código</label>
            <Input name="codigo" defaultValue={evento.codigo} required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Data</label>
            <Input name="dataServico" type="date" defaultValue={dataFormatada} required />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium">Horário</label>
            <Input name="horario" defaultValue={evento.horario} required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Vagas</label>
            <Input name="vagas" type="number" min="1" defaultValue={evento.vagas} required />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1 col-span-2">
            <label className="text-sm font-medium">Local/Missão</label>
            <Input name="local" defaultValue={evento.local} required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Equipe Alvo</label>
            <Input name="equipePrioritaria" defaultValue={evento.equipePrioritaria} required />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Tempo limite para resposta (minutos)</label>
          <Input name="slaMinutos" type="number" min="1" defaultValue={evento.slaMinutos ?? ""} placeholder="Deixe em branco para não expirar" />
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-sm font-medium">Sequência de Escalonamento (opcional)</label>
          <p className="text-xs text-slate-500">Se a Equipe Alvo não preencher as vagas a tempo, o sistema tenta nesta ordem.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[1, 2, 3].map((posicao) => (
              <select
                key={posicao}
                name={`escalonamento${posicao}`}
                defaultValue={evento.sequenciaEscalonamento[posicao - 1] ?? ""}
                className="h-10 rounded-md border border-input bg-white px-3 text-sm"
              >
                <option value="">{posicao}ª equipe seguinte...</option>
                {equipes.map((equipe) => (
                  <option key={equipe} value={equipe}>{equipe}</option>
                ))}
              </select>
            ))}
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-sm font-medium">Líderes/Supervisores autorizados a validar presença</label>
          <p className="text-xs text-slate-500">Selecione ao menos um. Só eles poderão fazer o check-in (Presente/Faltou) deste evento.</p>
          {lideres.length === 0 ? (
            <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-3">
              Nenhum usuário com papel Líder ou Supervisor cadastrado ainda.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-slate-200 rounded-md p-3">
              {lideres.map((lider) => (
                <label key={lider.id} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="validadores"
                    value={lider.id}
                    defaultChecked={validadoresAtuais.has(lider.id)}
                    className="rounded border-slate-300"
                  />
                  {lider.nome} <span className="text-slate-400">({lider.matricula})</span>
                </label>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <Link href="/admin/eventos">
            <Button type="button" variant="outline">Cancelar</Button>
          </Link>
          <Button type="submit">Salvar Alterações</Button>
        </div>
      </form>
    </div>
  )
}