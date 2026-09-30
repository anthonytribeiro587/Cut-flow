# Auditoria do Supabase existente

Data: 2026-09-30

## Resultado da aplicação CutFlow

- Reconfirmado antes da escrita: URL local aponta para ref `lqccsgrijnlgviiqojif`, projeto `projectmanager`, região `sa-east-1`, PostgreSQL 17.6.1; mesmo projeto desta auditoria.
- O inventário pré-migration coincidiu com a auditoria: `projects` 5, `vendors` 5, `project_vendors` 15, `project_stages` 50, `issues` 8, `project_updates` 6, `update_attachments` 0, `documents` 5. As três migrations históricas eram as mesmas.
- A migration `20260930201909_cutflow_domain_foundation.sql` foi aplicada remotamente. A primeira tentativa foi revertida por dependência entre `documents` e `project_stages`; a ordem local foi corrigida para remover `documents` primeiro e a aplicação seguinte teve sucesso, sem `CASCADE`.
- Confirmadas 21 tabelas CutFlow em `public`, PKs/FKs, índices definidos, seis enums, triggers de domínio e `set_updated_at`, 30 policies e RLS ativa em todas. `ensure_rls` e os helpers genéricos `set_updated_at()` e `rls_auto_enable()` foram preservados.
- Os objetos legados `projects`, `vendors`, `project_vendors`, `project_stages`, `issues`, `project_updates`, `update_attachments`, `documents` e `project_overview` não existem mais.
- Seed `Metalúrgica Horizonte` executado duas vezes sem duplicar registros; contagens após seed em `VERIFY.md`.
- Há 1 usuário em `auth.users` e 0 membros em `organization_members`; nenhum usuário foi criado, apagado ou associado automaticamente. Uma conta autenticada escolhida deverá ser associada à organização demo para acessar dados protegidos.
- `DEV/legacy-public-schema.sql` não foi criado: a CLI Supabase e `pg_dump` não estão instalados, impossibilitando o snapshot pelo CLI.
- `.env.local`, Auth, Storage, Realtime, extensões e schemas gerenciados não foram alterados. O cliente da aplicação não contém uso de `service_role` ou chave secreta.

Projeto remoto correspondente à URL existente: `projectmanager` · região `sa-east-1` · PostgreSQL 17.6
Nenhuma credencial foi incluída neste documento.

## Métodos

- Lidos os nomes de variáveis de `.env.local` sem imprimir valores: URL e chave pública Supabase.
- A leitura `GET /rest/v1/` com a chave pública local retornou HTTP 401 (`Invalid API key`; o endpoint OpenAPI requer chave service_role).
- A conexão autorizada do conector Supabase confirmou que a URL aponta para o projeto existente `projectmanager`. Foram executadas consultas somente leitura e listagens de catálogo. Nenhum comando remoto de escrita foi executado.
- O projeto está `ACTIVE_HEALTHY`, em PostgreSQL 17.6.1.
- Migrations registradas remotamente:
  - `20260930021817 init_projectmanager_mvp_schema`
  - `20260930022101 harden_and_index_mvp_schema`
  - `20260930034608 scope_authenticated_operational_writes`
- O checkout atual não contém as duas migrations iniciais. O histórico Git contém o SQL da terceira e os tipos/código antigos.

## Tabelas do schema public

O catálogo remoto retornou exatamente estas oito tabelas públicas antigas. Todas têm RLS ativado:

| Tabela | Linhas | Classificação | Referências/remediação |
|---|---:|---|---|
| `projects` | 5 | Legado Obra.flux | Projeto de obra; FKs internas e consumida pela view `project_overview`. |
| `vendors` | 5 | Legado Obra.flux | Empreiteiros/fornecedores de obra; FKs internas. |
| `project_vendors` | 15 | Legado Obra.flux | Associação projeto/empreiteiro. |
| `project_stages` | 50 | Legado Obra.flux | Etapas de obra. |
| `issues` | 8 | Legado Obra.flux | Pendências de projeto/etapa/fornecedor. |
| `project_updates` | 6 | Legado Obra.flux | Atualizações de obra. |
| `update_attachments` | 0 | Legado Obra.flux | Anexos de atualizações; sem referências `file_url` não nulas. |
| `documents` | 5 | Legado Obra.flux | Documentos de projetos; sem referências `file_url` não nulas. |

Todas as chaves estrangeiras retornadas ligam as tabelas acima entre si. Não foram encontrados dependentes genéricos das tabelas.

## Views, funções, triggers e policies

| Objeto | Classificação | Decisão |
|---|---|---|
| `public.project_overview` (view) | Legado Obra.flux confirmado pela definição: agrega projetos, fornecedores, issues e etapas | Remover explicitamente antes das tabelas, sem `CASCADE`. |
| `public.set_updated_at()` | Helper genérico reutilizável, usado por triggers das tabelas antigas | Preservar e reutilizar na migration; não substituir sua definição. |
| `public.rls_auto_enable()` | Helper genérico que habilita RLS em novas tabelas `public` | Preservar. |
| Event trigger `ensure_rls` | Infraestrutura genérica ligada a `rls_auto_enable` | Preservar. |
| Demais event triggers `issue_graphql_placeholder`, `pgrst_ddl_watch`, `pgrst_drop_watch`, `issue_pg_cron_access`, `issue_pg_net_access`, `issue_pg_graphql_access` | Infraestrutura Supabase/integrações | Preservar. |
| Triggers de tabela `trg_projects_updated_at`, `trg_vendors_updated_at`, `trg_project_vendors_updated_at`, `trg_project_stages_updated_at`, `trg_issues_updated_at` | Legado Obra.flux; ligados somente às tabelas antigas | Removidos automaticamente ao remover as respectivas tabelas. |
| Policies nas oito tabelas antigas | Legado Obra.flux | Todas limitadas às tabelas antigas e removidas junto delas. Policies exatas: `projects` (`authenticated read projects`, `demo public read projects`); `vendors` (`authenticated read vendors`, `demo public read vendors`); `project_vendors` (`authenticated read project_vendors`, `demo public read project_vendors`); `project_stages` (`authenticated read project_stages`, `authenticated update project_stages`, `demo public read project_stages`); `issues` (`authenticated read issues`, `authenticated insert issues`, `authenticated update issues`, `demo public read issues`); `project_updates` (`authenticated read project_updates`, `authenticated insert project_updates`, `demo public read project_updates`); `update_attachments` (`authenticated read update_attachments`, `demo public read update_attachments`); `documents` (`authenticated read documents`, `demo public read documents`). |
| Enums em `public` | Nenhum encontrado | Migration criará apenas os enums CutFlow solicitados. |

Não há funções de domínio antigas adicionais para remover. Nenhuma função, trigger genérico, event trigger ou policy independente será removida.

## Auth, Storage, extensões

- `auth.users` permanece como identidade da aplicação e será referenciada por FKs. A migration não altera tabelas nem triggers no schema `auth`.
- Nenhum bucket foi encontrado; não há referências de arquivo nas duas tabelas antigas que possuem coluna URL. A migration não acessa nem modifica `storage`.
- Extensões instaladas reportadas: `plpgsql`, `uuid-ossp`, `supabase_vault`, `pgcrypto` e `pg_stat_statements`. Nenhuma extensão será instalada, removida ou alterada.
- Nenhum outro schema Supabase será alterado.

## Referências locais antigas

O histórico no commit `34554cd` confirma que as oito tabelas são do domínio Obra.flux:
- `src/lib/supabase/database.types.ts`
- `src/services/project-service.ts`
- `supabase/migrations/20260930120000_scope_authenticated_operational_writes.sql`

O checkout CutFlow não contém services ou queries para essas tabelas. As rotas atuais são placeholders sem acesso ao banco.

## Plano de mudança preparado

A migration local `supabase/migrations/20260930201909_cutflow_domain_foundation.sql` remove apenas `project_overview` e as oito tabelas antigas identificadas acima, sem `CASCADE`. Ela preserva `set_updated_at()`, `rls_auto_enable()`, `ensure_rls`, demais objetos genéricos, Auth, Storage e extensões. Em seguida cria as tabelas, relacionamentos, constraints, índices, RLS e helpers do CutFlow em `public`.

A tabela de legado continha linhas (5 projetos, 5 fornecedores, 15 associações, 50 etapas, 8 pendências, 6 updates e 5 documentos). No momento da auditoria inicial, a migration ainda não havia sido aplicada nem o seed executado; a alteração foi autorizada e concluída depois, conforme o resultado no início deste documento.
