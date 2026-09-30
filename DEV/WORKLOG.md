# Worklog

## 2026-09-30 — Ativação remota e validação CutFlow

- Aplicada a migration no mesmo ref `lqccsgrijnlgviiqojif`. A primeira tentativa reverteu integralmente por ordem incorreta de dependência; `documents` foi movida antes de `project_stages` e a aplicação final confirmou sucesso.
- Removidos somente os oito objetos de tabela Obra.flux aprovados e `project_overview`; confirmadas 21 tabelas CutFlow, 21 RLS ativas, PKs/FKs, índices, seis enums, triggers e 30 policies. Helpers genéricos preservados.
- Seed `Metalúrgica Horizonte` executado duas vezes: 1 organização, 4 materiais, 29 espessuras, 5 processos, 3 máquinas, 3 relações máquina/processo, 54 parâmetros e 1 configuração; demais registros transacionais vazios. Nenhuma associação Auth foi criada.
- `auth.users`: 1; `organization_members`: 0. RLS revisada conceitualmente; membership isola por organização. Busca na aplicação não encontrou service role/chave secreta.
- `npm test` (5 testes), `npm run lint`, `npm run typecheck` e `npm run build` passaram. `.env.local` intacto; sem mudanças em Auth, Storage, Realtime, extensões ou UI completa.
- Snapshot SQL não disponível pois CLI Supabase e `pg_dump` não existem neste ambiente. Nenhum push realizado.

## 2026-09-30 — Checkpoint remoto antes da migration CutFlow

- Ref do `.env.local` confirmado sem expor chaves: `lqccsgrijnlgviiqojif`, projeto `projectmanager`, região `sa-east-1`, PostgreSQL 17.6.1; é o mesmo projeto da auditoria.
- Inventário remoto `public` revalidado antes da escrita: `projects` 5, `vendors` 5, `project_vendors` 15, `project_stages` 50, `issues` 8, `project_updates` 6, `update_attachments` 0, `documents` 5. As três migrations remotas também coincidem com a auditoria.
- `auth.users` contém 1 usuário. CLI Supabase e `pg_dump` não estão disponíveis neste ambiente; não foi possível gerar `DEV/legacy-public-schema.sql` via CLI. Nenhum snapshot por dados foi criado.
- Ajustado o seed para não associar implicitamente o primeiro usuário Auth como owner; a conta deve ser escolhida e associada explicitamente.

## 2026-09-30 — Fundação de domínio CutFlow

- Auditoria remota somente leitura confirmou o projeto Supabase existente, 3 migrations remotas, 8 tabelas legadas com linhas, a view antiga e os objetos genéricos a preservar; detalhes em `SUPABASE_AUDIT.md`.
- Preparada migration multi-tenant em `public`, RLS, constraints/índices/triggers, seed demo separado e repositories por domínio. Migration remota e seed não executados.
- Implementados repositories de organizations/perfis/configurações e domínios de clientes, materiais, máquinas, orçamentos, pedidos e produção; cálculos puros de peso/corte/custo e agenda de capacidade.
- Lint, typecheck, 5 testes unitários e build passaram. Vitest adicionado como dependência exata de desenvolvimento para os testes solicitados.
- Sem alteração de projeto, dados, Auth, Storage, schemas gerenciados, extensões, deploy ou push.

## 2026-09-30 — Fundação genérica Supabase

- Reinstalados `@supabase/supabase-js` e `@supabase/ssr`; adicionados clientes browser/server, helpers de ambiente e middleware de sessão/cookies para Next.js App Router.
- Mantido o projeto Supabase existente. `.env.local` não foi alterado; sem APIs ou domínio legado, migrations, tabelas ou operações remotas.
- Lint, typecheck e build passaram. Commit local criado conforme o contrato ativo; sem push.
- Detalhes em `VERIFY.md`.

## 2026-09-30 — Reset para CutFlow

- Removidas telas, rotas, APIs, serviços, tipos, autenticação, integração Supabase, migration versionada e documentação do produto anterior.
- Preservada a infraestrutura Next.js 15, React 19, TypeScript, Tailwind CSS 3, ESLint 9, PostCSS, aliases e configuração local de ambiente.
- Criados shell responsivo, navegação modular provisória, home enxuta, metadados, ícone e README CutFlow.
- Lint, typecheck e build passaram; checagem HTTP local respondeu 200. Navegador visual não está disponível neste ambiente.
- Detalhes de verificação em `VERIFY.md`.
