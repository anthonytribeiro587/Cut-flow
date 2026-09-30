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

Verificações disponíveis: `npm run lint`, `npm run typecheck`, `npm test` e `npm run build`.

A aplicação reutiliza `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`. A modelagem está em `supabase/migrations` e o seed demonstrativo separado em `supabase/seed/demo.sql`. Consulte `DEV/SUPABASE_AUDIT.md` antes de aplicar a migration: ela remove somente o domínio Obra.flux identificado no projeto atual. A migration não foi aplicada remotamente.
