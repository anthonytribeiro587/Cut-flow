# Active Spec — MVP operacional com Auth e escrita segura

## Objetivo

Continuar o MVP existente de gestão e acompanhamento físico de obras, preservando a interface, leituras reais do Supabase e responsividade já validadas. Priorizar autenticação simples, escrita autenticada e fluxos operacionais de etapas e pendências. Não fazer deploy.

## Ordem de trabalho

1. Implementar login/logout Supabase Auth com email e senha, sem signup público, persistência/restauração de sessão e retorno ao contexto anterior.
2. Registrar atualização real em `project_updates`, com etapa/progresso/pendência opcional, feedback, tratamento de rede/RLS/expiração e atualização imediata da interface.
3. Auditar RLS. Visitante mantém leitura pública; escrita requer usuário autenticado. Restringir políticas somente se necessário e de forma mais estrita, sem enfraquecer RLS, criar usuários ou fazer alteração destrutiva.
4. Edição operacional de etapas: status, progresso, responsável, datas previstas, observação e conclusão real.
5. Criar, editar e resolver pendências sem exclusão destrutiva; combinar filtros operacionais por estado, data, prioridade, projeto e terceirizado.
6. Refinar dashboard, próximos marcos, cronograma, terceiros, histórico e metadados de documentos; preservar layout e priorizar mobile a 390 px.
7. Revisar loading/empty/error, acessibilidade, consistência visual, performance, README e prontidão para Vercel.
8. Validar fluxo visitante e autenticado, lint, typecheck, build, audit, console, network, responsividade e segurança.

## Escopo definitivo do produto

“Gestão e acompanhamento físico de obras”. Não consultar, calcular, mapear ou mostrar orçamento, investimento, realizado, saldo, custo, valor de contrato, pagamentos, medições financeiras ou indicadores monetários. Campos antigos do banco são ignorados. Não implementar SAP, ERP, compras, fiscal, RH, multiempresa, WhatsApp ou automações externas.

## Autenticação e acesso

- Login somente por email/senha em `/login`; usuários serão provisionados manualmente no Supabase.
- Sem cadastro público, login social, MFA ou recuperação de senha.
- Visitantes mantêm leitura do MVP; somente autenticados podem executar as escritas operacionais previstas.
- Nunca usar chave `service_role`; usar apenas `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Não permitir escrita anônima nem simular sucesso. RLS continua habilitada e deve limitar operações às necessárias.

## Banco existente e limites

- Projeto `projectmanager` (ref `lqccsgrijnlgviiqojif`), PostgreSQL 17.
- Tabelas existentes: `projects`, `vendors`, `project_vendors`, `project_stages`, `issues`, `project_updates`, `update_attachments`, `documents`; view `project_overview` contém colunas financeiras e não deve ser usada.
- Não recriar banco/tabelas; não remover colunas; sem migrations destrutivas. Políticas RLS podem ser endurecidas se a auditoria provar necessidade e a alteração não ampliar acesso. Registrar decisão antes de qualquer escrita no banco.
- Não usar dados reais da empresa. Seeds atuais são fictícios.

## Decisões de implementação

- Preservar stack e camada de serviços Supabase existente; usar `@supabase/ssr` para sessão SSR/App Router se a auditoria/documentação atual confirmar que é a integração apropriada.
- Manter chamadas de banco em serviços/repos, com colunas explícitas e tipos estritos.
- Usar modal/drawer compacto para editar etapa e pendência, mantendo desktop e mobile.
- Ações esperadas: inserir atualização; atualizar etapa; inserir/atualizar pendência e marcar como resolvida. Sem exclusão operacional.
- Ajustar RLS apenas para que visitantes leiam e autenticados executem somente os fluxos aceitos pela aplicação; não criar política anônima de escrita.
- Auditoria de 2026-09-30 encontrou políticas `authenticated manage ...` com `ALL USING (true) WITH CHECK (true)` nas oito tabelas. Isso permite mutações além do escopo, inclusive exclusões. Decisão: substituir por leitura para authenticated nas tabelas sem escrita operacional; `project_stages` recebe somente SELECT/UPDATE; `issues`, SELECT/INSERT/UPDATE; `project_updates`, SELECT/INSERT. Manter políticas anon SELECT existentes e RLS habilitada. Registrar como migration SQL sem tocar em dados/tabelas/colunas.
- Migration `scope_authenticated_operational_writes` foi aplicada e conferida em `pg_policies`; a migration alterou somente policies, sem alteração de tabelas/colunas. No acceptance gate, os registros de teste foram inseridos pelas telas e removidos somente pelos IDs/sentinelas exatos; a etapa usada foi restaurada pela aplicação.
- O maestro provisionou manualmente uma conta fictícia de teste. Login, restauração de sessão, logout e gravações autenticadas foram validados localmente; nenhuma conta foi criada automaticamente.
- Dependência de sessão SSR: adicionar `@supabase/ssr` (versão estável consultada 0.12.7) para cookies compatíveis com App Router e middleware do Next 15; client usa somente URL e anon key públicas.
- Nenhum deploy.

## Critérios de aceite

- Visitante navega por todas as áreas, não consegue inserir/atualizar e é levado ao login preservando destino ao tentar escrever.
- Usuário Supabase previamente provisionado entra, mantém sessão após refresh, registra atualização, atualiza etapa, cria/edita/resolva pendência; operações persistem e refletem sem refresh manual.
- Erros de credencial, rede, token expirado e RLS são apresentados sem mensagens técnicas brutas.
- Indicadores do dashboard e marcos são derivados de dados operacionais reais.
- Todas as telas continuam sem dados financeiros e sem overflow a 390 px.
- `npm run lint`, `npm run typecheck`, `npm run build` e `npm audit --audit-level=low` passaram. Fluxos autenticados e bloqueios de visitante foram validados com um usuário Supabase previamente provisionado.
- Atualizar `DEV/HANDOFF.md`, `DEV/WORKLOG.md`, `DEV/VERIFY.md` e `DEV/CONTEXT.md` por bloco/final.

## Bloqueios conhecidos no início (resolvidos)

- A tentativa de insert anônimo em `project_updates` retornava `42501`; o endpoint exige Auth e recusa visitante com 401. O fluxo autenticado foi validado: POST respondeu 201 e a linha persistiu antes da limpeza pontual.
- Credenciais públicas locais estão em `.env.local` (Git-ignored). A sessão válida e a persistência foram verificadas com a conta de teste provisionada manualmente; a senha não foi adicionada a arquivo, log da aplicação ou documentação.
- Não criar usuários, não disparar email e não alterar dados de demonstração sem necessidade do teste autorizado.

## Status

- State: complete
- Owner: Codex + maestro
- Updated: 2026-09-30
