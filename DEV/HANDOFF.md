# Handoff CutFlow

Atualizado: 2026-09-30 · Contrato ativo: `SPECS/ACTIVE.md`

## Estado

- O produto anterior foi removido da aplicação.
- A fundação CutFlow contém shell responsivo, navegação para os módulos previstos e uma home inicial sem dados simulados.
- Stack preservada: Next.js 15, React 19, TypeScript, Tailwind CSS 3 e ESLint 9.
- A fundação genérica Supabase foi preparada com clientes browser/server e middleware SSR/cookies; reutiliza o projeto já configurado nas variáveis existentes.
- Nenhuma regra de negócio, API, tipo ou service legado foi restaurado. Nenhuma migration/tabela foi criada ou executada e nenhum projeto Supabase novo foi criado.
- `.env.local` foi preservado sem alteração. Não houve acesso ao banco nem alteração em configuração externa da Vercel.
- Lint, typecheck e build passaram. Nenhuma operação remota foi executada.

## Próximo passo

Definir a modelagem do banco CutFlow usando o projeto Supabase existente antes de implementar regras de orçamento, capacidade, pedidos ou produção. Ver resultados das verificações em `VERIFY.md`.
