# Verificação CutFlow

Atualizado em 2026-09-30.

## Banco remoto

- Projeto confirmado antes da alteração: `projectmanager`, ref `lqccsgrijnlgviiqojif`, `sa-east-1`, PostgreSQL 17.6.1 — mesmo projeto da auditoria.
- Migration `20260930201909_cutflow_domain_foundation.sql` aplicada e registrada remotamente como `cutflow_domain_foundation` (versão registrada pelo Supabase: `20260930204915`). A primeira tentativa foi revertida por dependência `documents_stage_id_fkey`; a ordem foi corrigida antes da aplicação bem-sucedida.
- Confirmadas as 21 tabelas: organizations, profiles, organization_members, customers, materials, material_thicknesses, processes, machines, machine_processes, machine_process_parameters, quotes, quote_items, quote_item_holes, quote_item_operations, orders, order_items, production_orders, production_operations, machine_schedule_entries, production_logs e settings.
- Todas as 21 têm PK e RLS habilitada; FKs e índices definidos estão presentes. Seis enums, triggers esperados e 30 policies foram confirmados. As policies empresariais exigem membro da organização e limitam linhas ao `organization_id` associado. Revisão conceitual dos predicates RLS, sem enfraquecê-los.
- Zero objetos legados permanecem: `projects`, `vendors`, `project_vendors`, `project_stages`, `issues`, `project_updates`, `update_attachments`, `documents` e `project_overview`. Helpers genéricos preservados.
- Seed executado duas vezes para verificar idempotência. Contagens: organizations 1; profiles 0; organization_members 0; customers 0; materials 4; material_thicknesses 29; processes 5; machines 3; machine_processes 3; machine_process_parameters 54; settings 1; quotes, quote_items, quote_item_holes, quote_item_operations, orders, order_items, production_orders, production_operations, machine_schedule_entries e production_logs 0.
- `auth.users`: 1; membros da organização demo: 0. Nenhum usuário foi criado, associado automaticamente ou apagado. Associar explicitamente uma conta autenticada antes de a UI consumir dados protegidos.
- Busca na aplicação não encontrou `service_role`, `SUPABASE_SERVICE_ROLE` ou `sb_secret`. `.env.local`, Auth, Storage, Realtime, extensões e schemas gerenciados preservados.
- Snapshot `DEV/legacy-public-schema.sql` não gerado porque `supabase` CLI e `pg_dump` não estão disponíveis.

## Código local

- npm run lint — passou.
- npm run typecheck — passou.
- npm test — passou: 2 arquivos, 5 testes.
- npm run build — passou com Next.js 15.5.26.
- Checagem estrutural SQL — 21 tabelas CutFlow confirmadas remotamente, todas com RLS; drops limitados à view e oito tabelas aprovadas.
- CLI Supabase, `pg_dump`, `psql` e Docker não estão disponíveis para snapshot/lint SQL local.
- Commit local `feat: activate CutFlow schema on Supabase` solicitado; sem push.

## Alterações

- Migration versionada 20260930201909_cutflow_domain_foundation.sql; seed separado supabase/seed/demo.sql.
- Repositories para organizações/membros, perfis, settings, clientes, materiais/processos, máquinas/parâmetros, orçamentos, pedidos, produção e agenda.
- Cálculo industrial puro de peso líquido (com furos), corte, piercings, tempo, custo e preço com markup.
- Planejador puro de capacidade em dias úteis, turnos, reservas e buffer comercial.
- Vitest exato 5.0.3 adicionado como dependência de desenvolvimento para os testes pedidos.
