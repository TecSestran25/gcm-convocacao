// src/lib/schemas.ts
import { z } from "zod"

// Regras para o cadastro e edição de Guardas (GCM)
export const gcmSchema = z.object({
  nome: z.string()
    .min(3, "O nome deve ter pelo menos 3 caracteres")
    .max(100, "O nome é demasiado longo"),
  matricula: z.string()
    .min(3, "A matrícula deve ter pelo menos 3 algarismos")
    .regex(/^[0-9]+$/, "A matrícula deve conter apenas números"),
  equipe: z.string()
    .min(1, "A equipe é obrigatória"),
  telefone: z.string().optional(),
  cnh: z.string().optional(),
  role: z.string().optional(),
  observacoes: z.string().optional(),
  especializacoes: z.string().optional(),
  novaSenha: z.string().optional()
})

// Regras para a criação e edição de Eventos (Convocações)
export const eventoSchema = z.object({
  codigo: z.string().min(2, "O código da missão é obrigatório"),
  dataServico: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Insira uma data válida",
  }),
  horario: z.string().min(5, "O horário é obrigatório (ex: 08:00 - 20:00)"),
  local: z.string().min(3, "O local da missão é obrigatório"),
  vagas: z.preprocess(
    (val) => parseInt(val as string, 10),
    z.number().min(1, "O evento deve ter pelo menos 1 vaga disponível")
  ),
  equipePrioritaria: z.string().min(1, "A equipa alvo é obrigatória")
})