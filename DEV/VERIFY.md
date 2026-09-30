# Verificação CutFlow

Atualizado em 2026-09-30.

## Banco remoto (somente leitura)

- Conector confirmou o projeto existente projectmanager em sa-east-1, PostgreSQL 17.6 e estado saudável.
- Foram listadas 3 migrations remotas e as 8 tabelas legadas em public; todas com RLS habilitado. Consulte SUPABASE_AUDIT.md para contagens, policies, triggers, funções, view, extensões e Storage.
- Inspeção somente leitura confirmou que a view project_overview depende das tabelas antigas; a migration a remove explicitamente antes delas.
- Nenhuma escrita remota ocorreu. Migration estrutural **não aplicada**; seed não executado.

## Código local

- npm run lint — passou.
- npm run typecheck — passou.
- npm test — passou: 2 arquivos, 5 testes.
- npm run build — passou com Next.js 15.5.26.
- Checagem estrutural SQL — 21 tabelas criadas e todas as 21 têm RLS explicitamente habilitado; objetos de remoção limitados a project_overview e às 8 tabelas antigas. O SQL não foi executado em banco local/remoto.
- Não há psql nem Docker neste ambiente; não foi possível executar lint PostgreSQL local. Migration permanece sujeita a revisão SQL adicional antes de aplicar.
- git status --short e commit local solicitados registrados ao final da execução.

## Alterações

- Migration versionada 20260930201909_cutflow_domain_foundation.sql; seed separado supabase/seed/demo.sql.
- Repositories para organizações/membros, perfis, settings, clientes, materiais/processos, máquinas/parâmetros, orçamentos, pedidos, produção e agenda.
- Cálculo industrial puro de peso líquido (com furos), corte, piercings, tempo, custo e preço com markup.
- Planejador puro de capacidade em dias úteis, turnos, reservas e buffer comercial.
- Vitest exato 5.0.3 adicionado como dependência de desenvolvimento para os testes pedidos.
