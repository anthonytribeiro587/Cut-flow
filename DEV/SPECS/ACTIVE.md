# Contrato ativo — Fundação de domínio CutFlow

## Objetivo

Ativar a fundação multi-tenant do CutFlow no mesmo projeto Supabase auditado, validar RLS/seed e verificar a aplicação local. A construção completa da UI permanece fora desta tarefa.

## Escopo e restrições

- Reutilizar o projeto já configurado no `.env.local`; não criar outro projeto.
- Preservar `.env.local`, Auth, Storage, configurações Supabase e schemas gerenciados.
- Aplicar a migration versionada somente em `public` após reconfirmar ref e inventário remoto compatível com a auditoria.
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
- Migration estrutural aplicada no projeto Supabase original, seed idempotente executado, validações documentadas e commit local criado sem push.

## Estado

- Concluído em 2026-09-30: migration aplicada no ref auditado, seed aplicado sem vínculo automático de usuário, validações locais/remotas registradas. UI completa não iniciada nesta tarefa.
