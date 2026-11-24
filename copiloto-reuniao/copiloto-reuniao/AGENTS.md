# AGENTS.md

Guia para agentes de código (Claude Code e similares) que trabalharem neste repositório.

## O que é
Copiloto de Reunião: artifact do Claude que ouve reuniões presenciais, sugere perguntas em tempo real e gera a ata (PDF e .txt). Nível de maturidade N0+: sem back-end, roda dentro do Claude com as capacidades `dictation`, `sample` e `downloads`.

## Comandos
- `npm run verificar`: BREX + testes + build (rode antes de qualquer commit)
- `npm run build`: gera `dist/index.html`
- `npm test`, `npm run brex`, `npm run bench`

## Onde ler antes de mudar
- `docs/como-funciona-no-claude.md`: contrato com a plataforma
- `docs/arquitetura.md`, `docs/SNS.md`, `docs/DMRL.md`: estrutura e módulos
- `brex/BREX.md`: regras de código
- `docs/decisoes.md`, `docs/glossario.md`

## Regras práticas
- Regra de negócio só em `logic.ts`, com teste ao lado (`logic.test.ts`).
- Novo arquivo: cabeçalho DMC + linha na `docs/DMRL.md` (+ seção no `docs/SNS.md` se for nova).
- Texto do Claude ou do usuário nunca entra no HTML sem `esc()`.
- Commits: `feat(CPR-40-10-00-200A): descrição`. Nada vai para o GitHub sem aprovação do dono do produto.
