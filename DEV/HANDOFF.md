# Handoff CutFlow

Atualizado: 2026-09-30 · Contrato ativo: `SPECS/ACTIVE.md`

## Estado

- Aplicação ainda usa shell e páginas de módulo provisórias.
- A infraestrutura SSR genérica Supabase continua apontando para o projeto existente `projectmanager`.
- Auditoria remota somente leitura completada; ver `DEV/SUPABASE_AUDIT.md`.
- Migration multi-tenant CutFlow, seed demo separado, repositories por domínio, cálculos puros e planejador de capacidade preparados localmente.
- Migration destrutiva **não aplicada** e seed não executado.
- `set_updated_at()`, `rls_auto_enable()`, `ensure_rls`, Auth, Storage, extensões e demais schemas preservados.
- Vitest adicionado como dependência exata de desenvolvimento para testes pedidos.

## Antes de aplicar migration

- Revisar a perda dos dados antigos: tabelas legadas contêm 5 projetos, 5 fornecedores, 15 relações, 50 etapas, 8 issues, 6 updates e 5 documentos.
- Confirmar snapshot/backup adequado fora desta mudança local.
- Migration só remove a view `project_overview` e as oito tabelas antigas confirmadas; não usa `CASCADE` nem remove funções genéricas.
- Seed seleciona o primeiro usuário Supabase como owner demo; revise esse alvo antes de executá-lo num ambiente compartilhado.

Ver evidências em `DEV/VERIFY.md`.
