/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

// 1. Cria a piscina de conexões usando a URL do Supabase
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

// 2. Inicializa o adaptador oficial do Postgres
const adapter = new PrismaPg(pool)

// 3. Injeta o adaptador no Prisma (Exigência da versão 7+)
const prisma = new PrismaClient({ adapter })

async function main() {
  const senhaHash = await bcrypt.hash('admin123', 10)

  const admin = await prisma.usuario.upsert({
    where: { matricula: '00000' },
    update: {},
    create: {
      matricula: '00000',
      senha: senhaHash,
      nome: 'Comando GCM',
      role: 'ADMIN',
      status: 'ATIVO',
    },
  })

  console.log('✅ Usuário Admin criado com sucesso:', admin.nome)
}

main()
  .catch((e) => {
    console.error('❌ Erro ao criar usuário:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
