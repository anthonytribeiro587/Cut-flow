# Contrato ativo — Reset e fundação CutFlow

## Objetivo

Remover o produto anterior e preparar a base profissional do CutFlow, sem implementar o SaaS completo.

## Identidade

- Nome: CutFlow
- Descrição: Orçamentos e produção industrial
- Descrição técnica: SaaS de orçamento, planejamento de capacidade e gestão da produção industrial.

## Escopo implementado nesta etapa

- Home inicial com identidade CutFlow e três cartões simples: Orçamentos, Produção e Capacidade.
- Navegação adaptada a desktop e mobile para visão geral, orçamentos, pedidos, produção, planejamento, clientes, materiais, máquinas, relatórios e configurações.
- Rotas de módulo provisórias sem lógica de negócio.
- Preservar a infraestrutura saudável de Next.js, React, TypeScript, Tailwind, ESLint, PostCSS, aliases e build.
- Remover telas, APIs, dados, tipos, serviços, assets e integração do produto anterior.

## Restrições

- Não apagar histórico ou recriar o repositório; não executar `git init`.
- Não remover ou editar secrets e variáveis locais; preservar `.env.local`.
- Não acessar nem alterar Supabase, dados ou configuração externa da Vercel; não executar migrations ou deploy.
- Não implementar funcionalidades do produto nesta etapa.
- Não fazer push. O pedido original permite commit local se tudo estiver correto.

## Aceite

- Nenhuma referência textual ou visual ao produto anterior permanece no repositório.
- README descreve apenas tecnologias presentes e o estado real.
- `npm run lint`, `npm run typecheck` e `npm run build` passam.
- Exibir `git status --short` no resumo final.

## Estado

- Em execução.
- Atualizado: 2026-09-30.
