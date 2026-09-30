# Contrato ativo — Fundação genérica Supabase para CutFlow

## Objetivo

Preparar clientes genéricos Supabase para Next.js App Router, reutilizando o projeto já configurado no repositório.

## Identidade

- Nome: CutFlow
- Descrição: Orçamentos e produção industrial
- Descrição técnica: SaaS de orçamento, planejamento de capacidade e gestão da produção industrial.

## Escopo desta etapa

- Instalar `@supabase/supabase-js` e `@supabase/ssr`.
- Criar cliente browser, cliente server e atualização de sessão/cookies para o App Router.
- Reutilizar as variáveis existentes do `.env.local` sem ler ou alterar esse arquivo.
- Preservar toda a infraestrutura saudável já existente.

## Restrições

- Não apagar histórico ou recriar o repositório; não executar `git init`.
- Não remover ou editar secrets e variáveis locais; preservar `.env.local`.
- Não criar outro projeto Supabase, nem executar migrations ou criar tabelas.
- Não restaurar regras de negócio, APIs, tipos ou services antigos.
- Não apagar dados/tabelas existentes, nem acessar ou alterar configuração externa da Vercel.
- Não implementar funcionalidades do produto nesta etapa.
- Não fazer push. O pedido original permite commit local se tudo estiver correto.

## Aceite

- Pacotes e clientes Supabase SSR genéricos disponíveis para browser e server.
- `.env.local` intacto; sem projeto remoto novo, migrations ou tabelas.
- `npm run lint`, `npm run typecheck` e `npm run build` passam.
- Commit local `chore: prepare Supabase foundation for CutFlow`; sem push.

## Estado

- Em execução.
- Atualizado: 2026-09-30.
