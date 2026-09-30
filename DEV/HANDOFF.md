# Handoff CutFlow

Atualizado: 2026-09-30 · Contrato ativo: `SPECS/ACTIVE.md`

## Estado

- Aplicação ainda usa shell e páginas de módulo provisórias.
- A infraestrutura SSR genérica Supabase continua apontando para o projeto existente `projectmanager`.
- Migration CutFlow aplicada no mesmo projeto Supabase `projectmanager` auditado; seed demo idempotente executado. Evidências em `DEV/SUPABASE_AUDIT.md` e `DEV/VERIFY.md`.
- CutFlow é o domínio ativo, com 21 tabelas e RLS ativa. A view e as oito tabelas legadas Obra.flux foram removidas.
- Helpers `set_updated_at()`, `rls_auto_enable()`, event trigger `ensure_rls`, Auth, Storage, Realtime e extensões foram preservados.
- Há 1 usuário Auth e 0 membros na organização demo. Associar explicitamente o usuário escolhido antes da UI consultar dados protegidos; nenhum usuário ou senha foi inventado.
- Vitest adicionado como dependência exata de desenvolvimento para testes pedidos.

## Próximos passos

- Associar explicitamente uma conta autenticada existente à organização demo quando o usuário indicar qual conta deve ser usada.
- A UI completa segue fora do escopo desta tarefa.

Ver evidências em `DEV/VERIFY.md`.
