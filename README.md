# GCM Convocação - MVP

Sistema desenvolvido para automatizar e gerenciar as convocações de efetivo da Guarda Civil Municipal (GCM) para eventos e necessidades operacionais do serviço. O sistema facilita a distribuição de vagas, controle de escala (roleta) e o registro de presenças/ausências.

## 🚀 Funcionalidades Principais (MVP)

- **Gestão de Efetivo:** Cadastro de guardas (GCM) e administradores (Chefia), contendo dados como matrícula, CNH, equipe (Ex: ALFA, BRAVO) e status de atividade.
- **Gestão de Eventos:** Criação de eventos pela chefia, definindo data, horário, local, número de vagas e equipes prioritárias.
- **Fluxo de Convocação:** - Notificação/Fila de guardas para os eventos.
  - O GCM pode responder às convocações com aceite ou recusa.
  - A chefia pode confirmar a presença ou registrar a ausência do guarda após o evento.
- **Controle de Escala (Roleta):** Monitoramento do total de serviços extras no mês e registro da data do último serviço extra para garantir uma distribuição justa.

## 🛠️ Tecnologias Utilizadas

Este projeto foi construído com as seguintes tecnologias:

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Linguagem:** TypeScript
* **Estilização e UI:** [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), Radix UI e Lucide React
* **Banco de Dados & ORM:** PostgreSQL com [Prisma ORM](https://www.prisma.io/)
* **Autenticação:** [NextAuth.js](https://next-auth.js.org/) (com criptografia bcryptjs)

## 🗄️ Estrutura do Banco de Dados

O banco de dados é gerido via Prisma e possui as seguintes entidades principais:

1. **Usuario:** Representa o efetivo (GCM e ADMIN). Armazena dados pessoais, equipe, controle de roleta (total de eventos no mês, último evento) e status.
2. **Evento:** Eventos criados pela chefia contendo os dados do serviço operacional.
3. **Convocacao:** Tabela pivô que relaciona os usuários aos eventos. Gerencia o status da chamada (`PENDENTE`, `ACEITO`, `RECUSADO`, `CONFIRMADO`, `AUSENTE`).

## ⚙️ Como executar o projeto localmente

### Pré-requisitos

- Node.js instalado (versão 18+ recomendada)
- Banco de Dados PostgreSQL rodando (local ou nuvem)

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/seu-usuario/gcm-convocacao.git](https://github.com/seu-usuario/gcm-convocacao.git)
   cd gcm-convocacao

2. **Instale as dependências:**
   ```bash
    npm install

3. **Configuração de Variáveis de Ambiente:**
    ```Code Snippet
      # Configuração do Banco de Dados
      DATABASE_URL="postgresql://usuario:senha@localhost:5432/gcm_convocacao?schema=public"

      # Configuração do NextAuth
      NEXTAUTH_SECRET="sua_chave_secreta_aqui"
      NEXTAUTH_URL="http://localhost:3000"

4. **Prepare o Banco de Dados (Prisma):**
   ```bash
    npx prisma generate
    npx prisma db push


5. **Inicie o servidor de desenvolvimento:**
   ```bash
    npm run dev

6. **Acesse a aplicação:**
  Abra http://localhost:3000 no seu navegador.

# Status de Desenvolvimento - GCM Convocação (MVP)

**Data da última atualização:** [Insira a data atual]
**Fase Atual:** Desenvolvimento Ativo do MVP (Fase 1)

O desenvolvimento da aplicação já foi iniciado e a arquitetura base do sistema encontra-se estabelecida. Abaixo está o mapeamento do que já foi estruturado e quais são os próximos passos.

## ✅ O que já está implementado (Estrutura Base)

### 1. Arquitetura e Configurações Iniciais
- **Framework:** Next.js (App Router) configurado e rodando.
- **Estilização:** Tailwind CSS v4 integrado.
- **Biblioteca de UI (shadcn/ui):** Componentes base já instalados na pasta `src/components/ui/` (Badge, Button, Card, Dialog, Input, Label, Table).

### 2. Banco de Dados (Prisma ORM)
O esquema do banco de dados (`prisma/schema.prisma`) já foi totalmente modelado e reflete as regras de negócio do MVP, contemplando:
- Tabela `Usuario` (GCM e ADMIN) com controle de equipe e roleta (`totalGecpMes`, `ultimoExtra`).
- Tabela `Evento` com dados de vagas, local, horário e equipe prioritária.
- Tabela pivô `Convocacao` com os status da chamada (`PENDENTE`, `ACEITO`, `RECUSADO`, `CONFIRMADO`, `AUSENTE`).
- *Seed base* de dados configurado (`prisma/seed.ts`).

### 3. Autenticação e Segurança
- **NextAuth.js:** Configuração inicial criada (`src/auth.ts` e `src/auth.config.ts`).
- **Página de Login:** Interface de login desenvolvida (`src/app/login/page.tsx`).
- Proteção de rotas estruturada para separar acessos de `admin` e `gcm`.

### 4. Estrutura de Rotas e Páginas (Frontend)
As pastas e páginas principais já foram criadas e divididas por perfil de acesso:
- **Painel Administrativo (Chefia):**
  - Layout exclusivo (`src/app/admin/layout.tsx`).
  - Dashboard Admin (`src/app/admin/dashboard/page.tsx`).
  - Gestão de Efetivo: Página e Server Actions (`src/app/admin/efetivo/`).
  - Gestão de Eventos: Página e Server Actions (`src/app/admin/eventos/`).
- **Painel do GCM (Guarda):**
  - Layout exclusivo (`src/app/gcm/layout.tsx`).
  - Área de Convocações: Página e Server Actions para visualização de chamadas (`src/app/gcm/convocacoes/`).

---

## 🚧 O que está em desenvolvimento (Work in Progress)

Neste momento, o foco do desenvolvimento está na integração entre as telas construídas e as ações no banco de dados (Server Actions):

- **CRUD de Efetivo e Eventos:** Finalização das lógicas no arquivo `actions.ts` para que a chefia consiga salvar e editar guardas e eventos reais no banco de dados.
- **Lógica de Convocação (A "Roleta"):** Implementação do algoritmo no backend que, ao criar um evento, busca os GCMs corretos (da equipe prioritária e com menor número de extras) e gera os registros na tabela `Convocacao`.
- **Interação do GCM:** Fazer os botões de "Aceitar" e "Recusar" na tela do GCM dispararem a atualização de status no banco de dados.

---

## ⏭️ Próximos Passos (Para fechar o MVP)

1. Concluir a integração completa das Server Actions com o Prisma.
2. Criar a interface para a Chefia confirmar a presença (`CONFIRMADO` ou `AUSENTE`) após a realização do evento.
3. Testes de Fluxo Completo: Simular um ciclo inteiro (Admin cria evento -> Sistema convoca GCM -> GCM loga e aceita -> Admin confirma presença).
4. Deploy em ambiente de Homologação/Teste (ex: Vercel) para validação com a equipe operacional da GCM.