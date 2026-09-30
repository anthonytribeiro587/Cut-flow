# CutFlow

SaaS de orçamento, planejamento de capacidade e produção industrial.

**Status:** Base inicial em desenvolvimento.

## Stack atual

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS 3
- ESLint 9
- Supabase (`@supabase/supabase-js` e `@supabase/ssr`) com clientes browser/server e middleware de sessão

## Desenvolvimento local

```bash
npm install
npm run dev
```

Verificações disponíveis: `npm run lint`, `npm run typecheck` e `npm run build`.

A conexão usa `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`, já configuradas localmente. A fundação não cria tabelas nem executa migrations.
