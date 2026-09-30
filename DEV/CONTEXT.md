# Contexto CutFlow

## Produto

CutFlow — Orçamentos e produção industrial. SaaS para orçamento, planejamento de capacidade, pedidos e produção industrial, inicialmente voltado a corte a laser e metalúrgicas.

## Estado atual

- Somente a fundação visual e a navegação provisória estão implementadas.
- Os módulos futuros são: dashboard, orçamentos, clientes, materiais, máquinas, processos, pedidos, produção, ordens de produção, planejamento, relatórios e configurações.
- Repositories por domínio, cálculos industriais e planejador de capacidade foram preparados neste escopo.
- A infraestrutura Supabase genérica está preparada com `@supabase/ssr`: clientes browser/server e atualização de cookies no middleware. Usa o projeto já configurado via `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Stack: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 3, ESLint 9, lucide-react e Supabase.

## Banco e segurança

- Reutilizar o projeto Supabase indicado pelas variáveis locais; não criar um projeto.
- O projeto remoto existente `projectmanager` (ref `lqccsgrijnlgviiqojif`, `sa-east-1`) continua sendo o único banco utilizado. A migration `20260930201909_cutflow_domain_foundation.sql` foi aplicada e o seed `Metalúrgica Horizonte` foi executado duas vezes sem duplicar registros.
- CutFlow é o domínio ativo em `public`: 21 tabelas, PKs/FKs, índices, enums, triggers, 30 policies e RLS ativa em todas.
- A view `project_overview` e as oito tabelas Obra.flux foram removidas sem `CASCADE`.
- Helpers genéricos `set_updated_at()`, `rls_auto_enable()` e event trigger `ensure_rls` foram preservados.
- Existe 1 usuário em `auth.users`, mas nenhum membro associado à organização demo. Associar explicitamente uma conta autenticada antes de consumir dados protegidos. Nenhum usuário foi criado/apagado e não há `service_role` no cliente.
- `.env.local`, Auth, Storage, Realtime, extensões e schemas gerenciados permanecem intactos.
- Decisão registrada: Vitest adicionado como dependência de desenvolvimento exata para os testes unitários pedidos.
