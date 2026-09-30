# Obra.flux

MVP demonstrativo de **gestão e acompanhamento físico de obras**. Reúne projetos, cronogramas, terceiros, pendências, atualizações e documentos fictícios em uma experiência responsiva para desktop e celular. Não é um ERP e não apresenta dados financeiros.

## Stack e arquitetura

- Next.js App Router, React, TypeScript e Tailwind CSS.
- Supabase Auth e PostgreSQL por meio de `@supabase/ssr`.
- Páginas em `src/app`, UI reutilizável em `src/components`, consultas/mapeamento em `src/services`, client e tipos em `src/lib/supabase`, contratos de UI em `src/types`.
- Visitantes têm leitura pública; usuários autenticados podem registrar atualizações, editar etapas e criar/editar/resolver pendências. RLS permanece habilitada. Usuários são provisionados manualmente no Supabase; não há cadastro público.
- Banco e dados de demonstração existentes são mantidos. A aplicação ignora campos monetários e não consulta a view `project_overview`.

## Executar localmente

1. Copie `.env.example` para `.env.local`.
2. Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` com as credenciais públicas do projeto Supabase de demonstração.
3. Execute:

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. Para validar o projeto:

```bash
npm run lint
npm run typecheck
npm run build
```

Para habilitar escrita, crie contas de demonstração manualmente em Supabase Auth e use email/senha em `/login`. Não configure `SUPABASE_SERVICE_ROLE_KEY` no app.

Deploy Vercel, upload de arquivos, SAP, financeiro, compras, notificações e automações externas estão fora do escopo deste MVP.

O escopo ativo e as decisões estão em `DEV/SPECS/ACTIVE.md`; o estado de handoff e as verificações ficam em `DEV/`.
