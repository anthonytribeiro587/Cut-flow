# Worklog

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
