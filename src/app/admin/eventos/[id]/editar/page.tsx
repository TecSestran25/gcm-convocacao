// src/app/admin/eventos/[id]/editar/page.tsx
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { atualizarEvento } from "../../actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default async function EditarEventoPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params

  const evento = await prisma.evento.findUnique({
    where: { id: resolvedParams.id }
  })

  if (!evento) redirect("/admin/eventos")

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