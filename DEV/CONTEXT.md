# Contexto CutFlow

## Produto

CutFlow — Orçamentos e produção industrial. SaaS para orçamento, planejamento de capacidade, pedidos e produção industrial, inicialmente voltado a corte a laser e metalúrgicas.

## Estado atual

- Somente a fundação visual e a navegação provisória estão implementadas.
- Os módulos futuros são: dashboard, orçamentos, clientes, materiais, máquinas, processos, pedidos, produção, ordens de produção, planejamento, relatórios e configurações.
- Não há regras de negócio nem dados de exemplo nesta base.
- A infraestrutura Supabase genérica está preparada com `@supabase/ssr`: clientes browser/server e atualização de cookies no middleware. Usa o projeto já configurado via `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Stack: Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 3, ESLint 9, lucide-react e Supabase.

## Limites desta etapa

- Não criar tabelas ou executar migrations sem nova etapa explícita de modelagem.
- Não configurar serviços externos ou fazer deploy.
- Manter a fundação simples enquanto os requisitos dos módulos não forem definidos.
