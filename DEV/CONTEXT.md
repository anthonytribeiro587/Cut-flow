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
- O conector autorizado confirmou o projeto existente `projectmanager`, migrations remotas e catálogo. O endpoint OpenAPI com chave pública local responde 401, mas foi possível auditar via conector.
- Migration CutFlow remove explicitamente a view legada `project_overview` e oito tabelas de domínio antigo confirmadas, sem `CASCADE`; não aplicar remotamente nesta tarefa.
- Helpers genéricos `set_updated_at()`, `rls_auto_enable()` e event trigger `ensure_rls` foram identificados e serão preservados.
- Auth, Storage, schemas gerenciados e variáveis locais devem permanecer intactos.
- Decisão registrada: Vitest adicionado como dependência de desenvolvimento exata para os testes unitários pedidos.
