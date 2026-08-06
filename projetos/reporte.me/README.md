Um sistema completo para organizar seu negócio e seu dia a dia: tarefas em quadros kanban, notas
rápidas, páginas e documentos com histórico de versões, formulários, automações, agenda, finanças,
arquivos, cursos em vídeo, equipe com permissões, e até o site da sua marca. 

Concepção, arquitetura e desenvolvimento completos com Next.js, NestJS, PostgreSQL, MongoDB, Redis e Cloudflare.



# Reporte.me

> **Slogan oficial:** _Reporte.me - o sistema que cresce junto com você._

O **Reporte.me** é um workspace que se molda ao jeito de cada pessoa trabalhar. Em vez de
forçar um único formato, ele oferece **páginas de tipos diferentes** — anotações, formulários,
quadros Kanban, finanças, cursos, sites no-code e automações — que convivem na mesma
organização, com versionamento e isolamento multi-tenant por trás.

---

## Sobre o Reporte.me

Pense numa ferramenta única para o profissional autônomo, o MEI, o professor, o dono de
e-commerce ou o freelancer: um lugar para **organizar tarefas, coletar dados, escrever,
cobrar, ensinar e automatizar** — sem precisar de cinco aplicativos diferentes.

A plataforma é **multi-tenant**: cada usuário pode pertencer a várias **organizações
(workspaces)**, com controle de acesso por papéis e convites de membros. Tudo que é sensível
é isolado por `orgId`, de ponta a ponta.

A personalidade da marca guia o produto: **confiante sem ser arrogante, acessível sem ser
simplório, organizado sem ser frio.**

---

## ✨ Funcionalidades

Cada item abaixo **existe no código** e é acessível por uma "página" dentro de um workspace.

| Funcionalidade | O que faz |
| --- | --- |
| 📝 **Anotações (Notas)** | Editor de texto rico (Tiptap) com conteúdo versionado. |
| 📋 **Formulários** | Construtor visual de formulários (arraste e solte). Coleta respostas, exporta **CSV**, gera **analytics** e pode **criar tarefas** automaticamente a cada submissão. |
| 🗂️ **Projetos (Kanban)** | Quadros com listas, cards, checklists, tags e grupos. Status de `BACKLOG` a `DONE`, **tarefas recorrentes**, lembretes de vencimento e **controle financeiro** por card. |
| 💰 **Finanças** | Ocorrências recorrentes (mensal/anual/semanal) com status de pagamento (pago, pendente, vencido) — ideal para mensalidades e cobranças. |
| 📁 **Arquivos** | Upload para **Cloudflare R2** com barra de progresso e URLs assinadas; gestão por organização e por página. |
| 🔖 **Bookmarks** | Coleção de links organizada por página. |
| 🌐 **Web Editor (no-code)** | Construtor visual de páginas/sites (baseado em Puck) renderizado como página pública. |
| 🎓 **Cursos** | Estrutura de seções e aulas (texto, **vídeo**, arquivo ou misto). **Vídeo via Cloudflare Stream** (upload resumável + HLS adaptativo + URLs assinadas); arquivos comuns no R2. **Acompanhamento de progresso**. |
| 🔁 **Workflows (automações)** | Designer visual (React Flow) com nós de gatilho, cálculo, loop, criação de registros, e-mail e notificações. Execução assíncrona e durável (filas + Outbox). |
| 🛍️ **Marketplace de templates** | Galeria de modelos prontos para criar páginas em segundos. |
| 🕑 **Versionamento** | Histórico de versões de páginas com restauração. |
| 👥 **Times & permissões** | Organizações, convites, **RBAC** (grupos e permissões), troca de organização e perfil com 2FA por push. |
| 💳 **Planos & cobrança** | Quotas por plano (workspaces, membros, páginas, tarefas, armazenamento) integradas ao **Asaas**. |
| 🔔 **Notificações** | Avisos in-app e **push** (OneSignal), além de lembretes de vencimento de tarefas. |
| 📊 **Dashboard** | Métricas de produtividade, evolução de trabalho, prioridades do dia e visão administrativa. |

Tudo isso é acessível por três aplicações: a **web** (app principal), o **admin** (console
SUPER_ADMIN) e uma **extensão de browser** que substitui a nova aba.

---

<details>
<summary><b>Arquitetura & Tecnologias</b></summary>
<br>

### Monorepo (Turborepo + pnpm)

```text
apps/
  web/         # Frontend principal (Next.js)         → porta 3001
  server/      # Backend e APIs (NestJS)              → porta 3002
  admin/       # Console SUPER_ADMIN (Next.js)        → porta 3005
  extension/   # Extensão de browser (new-tab)
packages/
  database/    # Prisma + schema PostgreSQL           (@reporte/database)
  ui/          # Design System shadcn/ui              (@reporte/ui)
  shared/      # Tipos e utils cross-feature          (@reporte/shared)
  email/       # Templates React Email                (@reporte/email)
  entitlements/# Quotas e feature-flags por plano     (@reporte/entitlements)
  features/
    editor/        # Editor de texto (Tiptap)
    form-builder/  # Construtor de formulários
    task-board/    # Kanban
    workflow/      # Automações
    marketplace/   # Templates
    pages/         # Catálogo multi-tipo de páginas
    ...             # course, files, iam, dashboard, notifications, web-editor
tests/         # Suíte E2E (Playwright)
config/        # Infra como código (env único + docker-compose)
```

### Stack

- **Frontend:** Next.js 16 (App Router, Turbopack), React 19, TypeScript 5.9, TailwindCSS, shadcn/ui, Radix UI.
- **Backend:** NestJS 11, Prisma ORM, **PostgreSQL** + **MongoDB**, **Bull/BullMQ** + **Redis**.
- **Banco:** PostgreSQL (relacional, via Prisma) e MongoDB (respostas de formulário, versões de página — alto volume/flexível).
- **Estado (web):** TanStack React Query (server state), Zustand (UI), `nuqs` (URL).
- **Validação:** Zod + React Hook Form.
- **Storage / Pagamentos:** Cloudflare R2, Asaas.

### Autenticação & multi-tenancy

Sessão própria emitida pelo **NestJS** (sem NextAuth). Cookies HttpOnly cross-subdomain
`.reporte.me`: **access JWT (15min)** + **refresh opaco (7d, com rotation)** + CSRF
double-submit. A organização ativa é o claim `orgId` **assinado no JWT** — nunca um header
do cliente. Autorização revalidada no backend via `RolesGuard`. Detalhes em
[docs/architecture.md](docs/architecture.md).

</details>

<details>
<summary><b>Vídeo de aulas & webhook (Cloudflare Stream)</b></summary>
<br>

O vídeo de aula é hospedado no **Cloudflare Stream** (separado do R2, que cuida só de
arquivos comuns). O binário sobe **direto do browser para a Cloudflare via TUS** (resumável,
não passa pelo backend); o NestJS só autoriza o upload e cria o registro local.

**Para que serve o webhook?** É o mecanismo pelo qual a Cloudflare **avisa a aplicação** que o
vídeo terminou de processar — sem ele, o backend ficaria "cego" sobre quando um vídeo está
pronto para ser exibido.

Transcodificar (gerar HLS, múltiplas qualidades e thumbnail) leva de segundos a minutos. Sem
webhook, a única forma de saber que terminou seria ficar perguntando à API do Stream em loop
(*polling*: "já terminou? já terminou?"). Com o webhook configurado:

1. Usuário faz upload do vídeo via TUS direto para o Stream.
2. Quando o Stream termina de processar (ou falha), **ele mesmo chama o endpoint**
   `POST https://dev-api.reporte.me/webhooks/cloudflare-stream`, informando que o vídeo de
   `uid: xyz` está `ready` (ou `error`).
3. O NestJS **valida a assinatura HMAC** do payload e atualiza o registro no banco:
   `status: processing → ready`, preenchendo `duration`, `thumbnailUrl` e `playbackUrl`.
4. O frontend, que mostrava "processando…", passa a exibir o player normalmente.

É um **callback assíncrono**: a Cloudflare avisa proativamente, em vez de o backend checar o
tempo todo — mais eficiente (menos requisições) e mais rápido (sabe na hora que terminou).

**Rede de segurança — job de reconciliação (BullMQ):** se o webhook não chegar (rede instável,
endpoint fora do ar no momento exato, túnel de DEV desligado), um job consulta a API do Stream
periodicamente para vídeos presos em `processing`/`pending_upload`, garantindo que o status
eventualmente fica correto mesmo sem o webhook funcionar perfeitamente.

> Em DEV o webhook precisa de URL pública: use `pnpm tunnel` (named tunnel `reporteme-dev` →
> `localhost:3002`, URL estável compartilhada com o webhook do Asaas). Sem o túnel, o job de
> reconciliação ainda leva o vídeo a `ready`.

</details>

<details>
<summary><b>Padrão de Arquitetura</b></summary>
<br>

Princípios em [docs/architecture.md](docs/architecture.md):

- **Feature-Based & Server-First:** dados resolvidos no servidor (Server Components); `'use client'` só para interação. Mutations via Server Actions, sempre com `revalidateTag`.
- **Adapter Pattern:** cada feature (`packages/features/*`) define **ports** (interfaces) e os **adapters** vivem em `apps/web/src/services/<feature>/`. Nunca importar Prisma dentro de `packages/features/`.
- **Multi-tenancy por `orgId`:** todo dado sensível é filtrado por organização, do roteamento às queries em Postgres e Mongo.
- **Barrel público:** cada package só expõe seu `index.ts`; proibido import profundo em `/src`.
- **SOLID + DRY:** baixo acoplamento, alta coesão, componentes pequenos e testáveis; sem `any` explícito, sem `console.log` (usar o logger do contexto).

</details>

<details>
<summary><b>Design (Manual da Marca)</b></summary>
<br>

Guia completo em [docs/BRAND.md](docs/BRAND.md).

**Paleta:**

| Token | Hex | Nome | Uso |
| --- | --- | --- | --- |
| `B900` | `#0455BF` | Azul Royal | Fundos escuros, contraste, texto |
| `B700` | `#0762D9` | Azul Vivo | CTA primário, acento, links |
| `B500` | `#3B82BF` | Azul Médio | Ícones secundários, bordas |
| `B300` | `#8BBBD9` | Azul Claro | Texto em fundo escuro, muted |
| `LIGHT` | `#F2F2F2` | Off-white | Background principal |

**Tipografia:** **CalSans** para títulos (`tracking-tighter`), **Inter** no corpo (`leading-relaxed`).

**Evitar:** "bento grids" decorativos sem função, glassmorphism excessivo, gradientes
multi-cor da marca. Foco em **respiração visual** e espaçamentos limpos.

</details>

<details>
<summary><b>Principais Libs</b></summary>
<br>

- `next`, `react`, `react-dom` — frontend
- `@nestjs/core`, `@nestjs/common` — backend
- `@prisma/client`, `mongodb` — persistência
- `bullmq` + `ioredis` — filas
- `@tanstack/react-query`, `zustand`, `nuqs` — estado
- `zod`, `react-hook-form` — validação
- `tailwindcss`, `lucide-react`, ecossistema `radix` — UI
- `@tiptap/*` (editor), `@puckeditor/core` (web editor), `reactflow` (workflow)
- `@playwright/test` — testes E2E
- `turbo`, `husky`, `commitlint` — tooling

</details>

---

## 🚀 Começando — subir o projeto localmente

> Manual passo a passo pensado para quem nunca rodou o projeto. Em ~15 minutos você terá
> tudo no ar e uma conta criada.

### Pré-requisitos

| Ferramenta | Versão | Observação |
| --- | --- | --- |
| **Node.js** | `24.15.0` | Está no `.nvmrc` → rode `nvm use` |
| **pnpm** | `>=10` | `corepack enable` já entrega a versão correta (`pnpm@10.33.2`) |
| **Docker** + Docker Compose | recente | Para Postgres, MongoDB, Redis e pgAdmin locais |
| **zsh** | — | Necessário **apenas** para o CLI `reporteme` (opcional) |

Confira:

```bash
node --version   # deve mostrar 24.15.0+
pnpm --version   # deve mostrar 10.x
docker --version
```

### Quickstart (copia-e-cola)

Forma manual — rode na raiz do repositório, na ordem:

```bash
# 1. Configuração de ambiente
cp config/.env.example config/.env
#    edite config/.env e preencha os 4 segredos (veja o passo 2)

# 2. Dependências (carrega o token privado do Tiptap via dotenv)
pnpm dlx dotenv-cli -e config/.env -- pnpm install

# 3. Infra local (Postgres, Mongo, Redis, pgAdmin) em Docker
pnpm infra:up

# 4. Banco: cria o schema e popula os planos
pnpm db:update     # prisma generate + db push + build
pnpm db:seed       # planos Free/Pro/Business/Enterprise (idempotente)

# 5. Build dos pacotes compartilhados + server
pnpm server:setup

# 6. Suba os apps (cada um em um terminal)
pnpm server:dev    # API   → http://localhost:3002
pnpm web:dev       # Web   → http://localhost:3001
pnpm admin:dev     # Admin → http://localhost:3005  (opcional)
```

**Atalho (o jeito mais fácil — sobe tudo de uma vez):**

```bash
./bin/reporteme dev:all
# Sobe a infra, abre o web no navegador e roda tunnel/server/web/admin/studio no tmux.
# Para derrubar tudo:  ./bin/reporteme dev:kill
```

> O `dev:all` ainda exige que você já tenha feito os passos 1, 2, 4 e 5 ao menos uma vez
> (env, `pnpm install`, banco e `server:setup`).

### Passo a passo explicado

#### 1. Instalar o projeto (pnpm)

```bash
git clone <url-do-repo> reporteme
cd reporteme
nvm use                                                   # usa o Node do .nvmrc
pnpm dlx dotenv-cli -e config/.env -- pnpm install        # instala tudo
```

Por que o `dotenv-cli` no install? O pacote `@reporte/editor` usa o **registry privado do
Tiptap**, e o token (`TIPTAP_PRO_TOKEN`) mora no `config/.env`. Sem ele, alguns pacotes não
baixam. (Se você ainda não copiou o `.env`, faça o passo 2 antes deste comando.)

#### 2. Docker e configs

O `config/` é a **fonte única de ambiente** em dev — um só `config/.env` alimenta web, admin,
server e Prisma.

```bash
cp config/.env.example config/.env
```

Abra `config/.env` e preencha **os 4 segredos** com valores aleatórios de 32+ caracteres
(podem ser quaisquer strings em dev):

```bash
JWT_SECRET=""           # gere com:  openssl rand -hex 32
AUTH_SECRET=""
JWT_REFRESH_SECRET=""
INTERNAL_API_SECRET=""
```

As demais variáveis **já vêm prontas para localhost** e você não precisa mexer:
`COOKIE_DOMAIN=` fica **vazio** em dev (localhost rejeita cookie com domínio), e os cookies
usam `secure=false` automaticamente. Variáveis de Google OAuth, Resend/SMTP, R2,
Asaas e OneSignal são **opcionais** — preencha só se for testar a feature correspondente.

Suba a infraestrutura local:

```bash
pnpm infra:up      # ou: ./bin/reporteme infra:up
```

Isso levanta quatro containers (dados persistidos em `data/` na raiz):

| Serviço | Container | Porta | Acesso |
| --- | --- | --- | --- |
| PostgreSQL 18 | `dcs-postgres` | `5432` | `postgres / postgres` |
| MongoDB 7 | `dcs-mongo` | `27017` | sem auth |
| Redis 7 | `dcs-redis` | `6379` | sem auth |
| pgAdmin | `dcs-pgadmin` | `8080` | http://localhost:8080 → `admin@reporte.me / admin` |

> `pnpm infra:down` derruba, `pnpm infra:logs` acompanha os logs.

#### 3. Banco de dados

```bash
pnpm db:update     # prisma generate + db push (cria as tabelas) + build do client
pnpm db:seed       # popula o catálogo de planos (Free/Pro/Business/Enterprise)
```

`db:seed` é **idempotente** (pode rodar quantas vezes quiser) e **não cria usuários** — só
os planos. Você criará sua conta pela tela de cadastro (passo 6).

#### 4. Build dos pacotes

```bash
pnpm server:setup
```

Esse comando instala e **compila** `@reporte/database`, `@reporte/shared`,
`@reporte/email`, `@reporte/entitlements` e o `server`. É obrigatório na primeira vez porque
o server em runtime importa o **`dist/`** do `@reporte/shared` — se ele não estiver buildado,
você verá `undefined` em runtime sem erro de TypeScript. Sempre que mexer no `shared`, rode
`pnpm shared:build` de novo.

#### 5. Subir os apps

**Forma manual** (um terminal por app):

```bash
pnpm server:dev    # NestJS  → http://localhost:3002  (Swagger em /docs)
pnpm web:dev       # Next.js → http://localhost:3001
pnpm admin:dev     # Next.js → http://localhost:3005  (opcional)
```

**Atalho com o CLI** (sobe tudo no tmux e abre o navegador):

```bash
./bin/reporteme dev:all
```

#### 6. Primeiro acesso

1. Abra **http://localhost:3001**.
2. Clique em **Criar conta** e registre-se com qualquer e-mail/senha.
3. Pronto: a conta entra no **plano Free** automaticamente e você cai no dashboard.

Para inspecionar o banco: `pnpm db:studio` (Prisma Studio) ou o pgAdmin em
http://localhost:8080.

### O CLI `reporteme` (atalho)

Na pasta `bin/` existe um menu interativo que centraliza todos os comandos do projeto.

```bash
./bin/reporteme          # abre o menu (setas para navegar, Enter executa, q/Esc sai)
./bin/reporteme list     # lista todos os comandos
./bin/reporteme infra:up # executa um comando direto
```

> Dica: crie um alias para usar a forma curta `reporteme ...`:
> `alias reporteme="$(pwd)/bin/reporteme"` (ou coloque `bin/` no seu `PATH`).

Destaques: `dev:all` (sobe tudo), `dev:kill` (derruba tudo), `dev:all:tests` (modo de teste),
`server:setup`, `db:update`, `db:seed`, `tests:*`. Comandos destrutivos — `reset:all`,
`db:wipe`, `mongo:wipe`, `*:pull:prod`, `db:update:prd` — **exigem confirmação digitada**,
então não há como apagar dados sem querer.

### Portas & URLs

| App / Serviço | URL | Porta |
| --- | --- | --- |
| Web (app principal) | http://localhost:3001 | 3001 |
| Server (API NestJS) | http://localhost:3002 | 3002 |
| Admin (console) | http://localhost:3005 | 3005 |
| pgAdmin | http://localhost:8080 | 8080 |
| Prisma Studio | (via `pnpm db:studio`) | 5555 |

### Resolução de problemas

| Sintoma | Causa provável | Solução |
| --- | --- | --- |
| `undefined` vindo do `@reporte/shared` em runtime | `dist/` não buildado | `pnpm shared:build` (ou `pnpm server:setup`) e reinicie o server |
| Cookie de sessão não cola / login não persiste | `COOKIE_DOMAIN` preenchido em dev | Deixe `COOKIE_DOMAIN=` **vazio** no `config/.env` |
| Erros de schema / Prisma client desatualizado | schema mudou sem regenerar | `pnpm db:update` |
| `pnpm install` falha em pacote do Tiptap | token privado não carregado | use `pnpm dlx dotenv-cli -e config/.env -- pnpm install` |
| Conexão recusada no Postgres/Mongo/Redis | infra não está de pé | `pnpm infra:up` e confira `pnpm infra:logs` |

> `pnpm tunnel` (Cloudflare) expõe o backend para a internet — útil só para testar
> callbacks de OAuth ou webhooks externos. **Não é necessário** para o dev do dia a dia.

---

## 🧪 Testes & Qualidade

### Testes E2E (Playwright)

A suíte fica em `tests/` e exercita a **API real** (sem mocks), batendo no banco local.

**Pré-requisitos:** apps no ar em **modo de teste** e browsers do Playwright instalados.

```bash
# 1. Suba os apps em modo de teste (server com NODE_ENV=test)
pnpm server:dev:test        # ou: ./bin/reporteme dev:all:tests
# 2. Instale os browsers (uma vez)
pnpm --filter @reporte/tests exec playwright install
# 3. Rode a suíte
pnpm test:e2e               # headless
pnpm test:e2e:ui           # Playwright UI (recomendado em dev)
pnpm test:e2e:headed       # navegador visível
```

Ou por feature, via CLI: `./bin/reporteme tests:auth`, `tests:forms`, `tests:task-board`,
`tests:pages`, `tests:billing`, `tests:workflow`, `tests:files`, `tests:course`,
`tests:workspace`, `tests:content`.

Cobertura atual: **auth, pages (versionamento), content, forms, task-board, billing,
workflow, files, course, workspace**. Os testes rodam com `workers: 1` (servidor e sessão
compartilhados) e fazem login uma vez por suíte, reaproveitando o cookie de sessão.

### Lint & commits

```bash
pnpm lint          # ESLint em web, admin e ui
pnpm lint:fix      # corrige o que dá para corrigir
pnpm commit        # commit assistido por IA (opencommit / oco)
```

Há **husky** + **commitlint** garantindo **conventional commits**
(`feat`, `fix`, `refactor`, `test`, `docs`, `chore`) no `commit-msg`.

---

## 🔁 Executar o featureImprove

O `featureImprove` é um **slash-command do Claude Code** que implementa/melhora uma feature
**ancorado no mapa** (`docs/features/`) — sem varredura ampla do repo. Ele recebe a **feature +
a sua solicitação**, orienta-se pelo mapa, cria uma branch, aplica a mudança respeitando a
arquitetura, roda um *guard* de revisão sobre o diff, mantém o mapa sincronizado e commita. Se a
feature não existir, ele a **cria** (via `new-feature` + template do mapa).

**Pré-requisitos:** árvore git limpa; `docs/features/index.md` populado (o mapa é a fonte);
`docs/BRAND.md` + `docs/architecture.md` presentes (os revisores os leem diretamente); `gh`
autenticado só se você pedir para abrir PR.

**Como rodar** (dentro de uma sessão do Claude Code, no VSCode ou terminal):

```text
/featureImprove <feature> "<solicitação de modificação/melhoria>"

/featureImprove notifications "adicionar filtro por lida/não-lida na lista"
/featureImprove forms "permitir campo de upload no form builder"
/featureImprove <nome-novo> "criar a feature X"   # cria a feature se não existir
```

O fluxo é **balanceado**: lê `docs/features/<feature>.md` (em vez de varrer o repo), cria
`feat/<feature>-<timestamp>`, implementa a solicitação, roda o `architecture-reviewer` sobre o
diff (+ `security`/`db-performance`/`ui-ux`/`lgpd-br` conforme o que a mudança tocar), consolida os
achados em `docs/features/feature-fix.md`, corrige os de maior severidade, **atualiza o mapa** e commita. O PR
**não** é aberto automaticamente — o command imprime o `gh pr create` pronto para você rodar.

**Artefatos:** branch `feat/<feature>-<timestamp>`, o log `docs/features/feature-fix.md` e o mapa
atualizado em `docs/features/<feature>.md`. Detalhes operacionais em
[docs/executar-featureimprove.md](docs/executar-featureimprove.md).

---

<details>
<summary><b>Versão & ChangeLog</b></summary>
<br>

**Versão Atual:** Em contínuo desenvolvimento iterativo.

> As próximas versões terão suas atualizações listadas neste documento e marcadas com todas as atualizações globais unificadas de pacotes em cada lançamento (bump sync).

</details>
