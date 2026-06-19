// src/app/admin/eventos/page.tsx
import { prisma } from "@/lib/prisma"
import { criarEvento } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function EventosPage() {
  // Busca os eventos ordenados pelos mais recentes primeiro
  const eventos = await prisma.evento.findMany({
    orderBy: { dataServico: 'desc' }
  })

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Gestão de Eventos (GECP)</h1>
        <p className="text-slate-500">Crie novas convocações operacionais.</p>
      </div>

      {/* Formulário de Criação de Evento */}
      <div className="bg-white p-4 rounded-md border border-slate-200">
        <form action={criarEvento} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-sm font-medium">Código</label>
            <Input name="codigo" required placeholder="Ex: GECP_001" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Data</label>
            <Input name="dataServico" type="date" required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Horário</label>
            <Input name="horario" required placeholder="Ex: 08:00 - 20:00" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium">Local/Missão</label>
            <Input name="local" required placeholder="Ex: PATRULHAMENTO CENTRO" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Vagas</label>
            <Input name="vagas" type="number" min="1" required placeholder="Ex: 4" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Equipe Alvo</label>
            <Input name="equipePrioritaria" required placeholder="Ex: ALFA" />
          </div>
          
          <Button type="submit" className="md:col-span-5">Publicar Convocação</Button>
        </form>
      </div>

      {/* Tabela de Eventos */}
      <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Horário</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Equipe</TableHead>
              <TableHead>Vagas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {eventos.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-slate-500 py-4">
                  Nenhum evento registrado.
                </TableCell>
              </TableRow>
            )}
            {eventos.map((evento) => (
              <TableRow key={evento.id}>
                <TableCell className="font-medium">{evento.codigo}</TableCell>
                {/* Formatação simples da data para o padrão BR */}
                <TableCell>{evento.dataServico.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</TableCell>
                <TableCell>{evento.horario}</TableCell>
                <TableCell>{evento.local}</TableCell>
                <TableCell>{evento.equipePrioritaria}</TableCell>
                <TableCell>{evento.vagas}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}