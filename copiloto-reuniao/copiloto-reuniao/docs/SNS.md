# SNS: numeração dos sistemas

Formato `SS-SE-AS` (sistema, seção, assunto), inspirado na ATA iSpec 2200. Sigla do projeto: **CPR**.

| SS-SE | Sistema › Seção | Pasta |
|---|---|---|
| 00-00 | Núcleo › Geral (página, BREX) | `src/index.html`, `brex/` |
| 00-10 | Núcleo › Design system | `src/styles/` |
| 00-20 | Núcleo › DOM | `src/core/dom.ts` |
| 00-30 | Núcleo › Tempo | `src/core/tempo.ts` |
| 00-40 | Núcleo › Armazenamento | `src/core/armazenamento.ts` |
| 00-60 | Núcleo › Aplicação (estado e fluxos) | `src/app/` |
| 00-70 | Núcleo › Tipos | `src/types/` |
| 30-00 | Reunião › Interface pública | `src/features/30-reuniao/index.ts` |
| 30-10 | Reunião › Transcrição | `src/features/30-reuniao/10-transcricao/` |
| 30-20 | Reunião › Gatilho | `src/features/30-reuniao/20-gatilho/` |
| 30-30 | Reunião › Contexto | `src/features/30-reuniao/30-contexto/` |
| 40-00 | Sugestões › Interface pública | `src/features/40-sugestoes/index.ts` |
| 40-10 | Sugestões › Perguntas | `src/features/40-sugestoes/10-perguntas/` |
| 40-20 | Sugestões › Resumo contínuo | `src/features/40-sugestoes/20-resumo/` |
| 40-30 | Sugestões › Cartões | `src/features/40-sugestoes/30-cartoes/` |
| 60-00 | Documentos › Interface pública | `src/features/60-documentos/index.ts` |
| 60-10 | Documentos › Ata | `src/features/60-documentos/10-ata/` |
| 60-20 | Documentos › PDF | `src/features/60-documentos/20-pdf/` |
| 60-30 | Documentos › Exportação | `src/features/60-documentos/30-exportacao/` |
| 80-00 | Integrações › Interface pública | `src/features/80-integracoes/index.ts` |
| 80-10 | Integrações › Claude (capacidades do artifact) | `src/features/80-integracoes/10-claude/` |
| 90-10 | Infraestrutura › Build | `scripts/build.mjs` |
| 90-20 | Infraestrutura › Estudo de eficiência | `scripts/bench*.{mjs,ts}` |
| 90-30 | Infraestrutura › CI | `.github/workflows/ci.yml` |

Capítulos reservados e sem uso na v1: 10 (identidade e acesso), 20 (cadastros), 50 (financeiro), 70 (arquivos e mídia).

## Information codes (IC)

| IC | Camada |
|---|---|
| 000 | Interface pública |
| 022 | BREX do projeto |
| 100 | Tipos e schemas |
| 200 | Lógica de domínio |
| 300 | Acesso a dados / plataforma |
| 400 | Interface (telas e componentes) |
| 700 | Testes |
| 900 | Configuração e scripts |
