# Contrato ativo — Fundação de domínio CutFlow

## Objetivo

Auditar em modo somente leitura o projeto Supabase existente e preparar a fundação multi-tenant do CutFlow, incluindo migration, RLS, seed separado, repositories, cálculos e planejamento de capacidade.

## Escopo e restrições

- Reutilizar o projeto já configurado no `.env.local`; não criar outro projeto.
- Preservar `.env.local`, Auth, Storage, configurações Supabase e schemas gerenciados.
- Preparar migration versionada somente em `public`; não aplicar remotamente enquanto o inventário remoto estiver inacessível ou incerto.
- Remover na migration somente objetos legados com evidência inequívoca, sem `CASCADE`.
- Criar seed demo separado, com parâmetros industriais explicitamente demonstrativos.
- Criar services por domínio e módulos puros de cálculo/scheduling com testes unitários.
- Executar lint, typecheck, testes e build; criar o commit local solicitado, sem push.
- Registrar em DEV decisões sobre dependências, escopo e limitações.

## Fora de escopo

DXF/DWG, nesting, IA, NFe, financeiro, ERP, estoque, otimização avançada, agenda drag-and-drop e pagamentos.

## Aceite

- Relatório de auditoria identifica evidências locais e limitações do acesso remoto.
- Schema, constraints, índices, RLS e triggers prontos em migration.
- Seed, camada de dados, cálculos e agenda preparados.
- Verificações locais aprovadas e commit `feat: establish CutFlow domain and database foundation` criado sem push.
- Qualquer migration destrutiva remota não aplicada fica claramente registrada.

## Estado

- Concluído localmente em 2026-09-30; migration remota não aplicada deliberadamente. Inventário remoto e motivos em DEV/SUPABASE_AUDIT.md.
