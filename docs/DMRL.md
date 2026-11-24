# DMRL: lista de módulos

Todo arquivo de código tem um cabeçalho `DMC` listado aqui. `npm run dmc` confere.

| DMC | Título | Arquivo | Status |
|---|---|---|---|
| CPR-00-00-00-022A | BREX computável — regras ESLint (Power of 10 adaptado) | `brex/eslint.brex.js` | verificação-1 |
| CPR-00-00-00-400A | Núcleo › Página (modelo do build) | `src/index.html` | verificação-1 |
| CPR-00-00-00-900A | Configuração do ESLint | `eslint.config.js` | verificação-1 |
| CPR-00-00-10-022A | BREX — fronteiras entre sistemas (dependency-cruiser) | `brex/.dependency-cruiser.cjs` | verificação-1 |
| CPR-00-00-20-022A | BREX — valida cabeçalhos DMC contra a DMRL e o SNS | `brex/check-dmc.mjs` | verificação-1 |
| CPR-00-10-00-400A | Núcleo › Design system › Tokens | `src/styles/tokens.css` | verificação-1 |
| CPR-00-10-10-400A | Núcleo › Design system › Estilos da interface | `src/styles/app.css` | verificação-1 |
| CPR-00-20-00-400A | Núcleo › DOM › Acesso tipado e escape de HTML | `src/core/dom.ts` | verificação-1 |
| CPR-00-30-00-200A | Núcleo › Tempo › Formatação de duração e datas | `src/core/tempo.ts` | verificação-1 |
| CPR-00-40-00-300A | Núcleo › Armazenamento › localStorage tolerante a falhas | `src/core/armazenamento.ts` | verificação-1 |
| CPR-00-60-00-200A | Núcleo › Aplicação › Estado da sessão e persistência | `src/app/sessao.ts` | verificação-1 |
| CPR-00-60-10-400A | Núcleo › Aplicação › Referências da interface e avisos | `src/app/ui.ts` | verificação-1 |
| CPR-00-60-20-400A | Núcleo › Aplicação › Fluxo de sugestões e resumo contínuo | `src/app/fluxo-sugestoes.ts` | verificação-1 |
| CPR-00-60-30-400A | Núcleo › Aplicação › Fluxo da ata, PDF e transcrição em .txt | `src/app/fluxo-documentos.ts` | verificação-1 |
| CPR-00-60-40-400A | Núcleo › Aplicação › Microfone, anotações e nova reunião | `src/app/fluxo-microfone.ts` | verificação-1 |
| CPR-00-60-50-400A | Núcleo › Aplicação › Ponto de entrada | `src/app/main.ts` | verificação-1 |
| CPR-00-70-00-100A | Núcleo › Tipos › Arquivos de fonte embutidos em base64 pelo build | `src/types/ativos.d.ts` | verificação-1 |
| CPR-30-00-00-000A | Reunião › Interface pública | `src/features/30-reuniao/index.ts` | verificação-1 |
| CPR-30-10-00-100A | Reunião › Transcrição › Tipos | `src/features/30-reuniao/10-transcricao/schemas.ts` | verificação-1 |
| CPR-30-10-00-200A | Reunião › Transcrição › Lógica de segmentos, janela e cortes | `src/features/30-reuniao/10-transcricao/logic.ts` | verificação-1 |
| CPR-30-10-00-700A | Reunião › Transcrição › Testes | `src/features/30-reuniao/10-transcricao/logic.test.ts` | verificação-1 |
| CPR-30-20-00-200A | Reunião › Gatilho › Quando pedir sugestões ao Claude | `src/features/30-reuniao/20-gatilho/logic.ts` | verificação-1 |
| CPR-30-20-00-700A | Reunião › Gatilho › Testes | `src/features/30-reuniao/20-gatilho/logic.test.ts` | verificação-1 |
| CPR-30-30-00-200A | Reunião › Contexto › Dados informados antes da reunião | `src/features/30-reuniao/30-contexto/logic.ts` | verificação-1 |
| CPR-40-00-00-000A | Sugestões › Interface pública | `src/features/40-sugestoes/index.ts` | verificação-1 |
| CPR-40-10-00-100A | Sugestões › Perguntas › Tipos | `src/features/40-sugestoes/10-perguntas/schemas.ts` | verificação-1 |
| CPR-40-10-00-200A | Sugestões › Perguntas › Prompt e normalização da resposta | `src/features/40-sugestoes/10-perguntas/logic.ts` | verificação-1 |
| CPR-40-10-00-700A | Sugestões › Perguntas › Testes | `src/features/40-sugestoes/10-perguntas/logic.test.ts` | verificação-1 |
| CPR-40-20-00-200A | Sugestões › Resumo contínuo › Prompt | `src/features/40-sugestoes/20-resumo/logic.ts` | verificação-1 |
| CPR-40-30-00-400A | Sugestões › Cartões › Lista animada (mais recente no topo) | `src/features/40-sugestoes/30-cartoes/components/cartoes.ts` | verificação-1 |
| CPR-60-00-00-000A | Documentos › Interface pública | `src/features/60-documentos/index.ts` | verificação-1 |
| CPR-60-10-00-100A | Documentos › Ata › Tipos | `src/features/60-documentos/10-ata/schemas.ts` | verificação-1 |
| CPR-60-10-00-200A | Documentos › Ata › Prompt, validação e versão em texto | `src/features/60-documentos/10-ata/logic.ts` | verificação-1 |
| CPR-60-10-00-400A | Documentos › Ata › Visualização na tela | `src/features/60-documentos/10-ata/components/ata.ts` | verificação-1 |
| CPR-60-10-00-700A | Documentos › Ata › Testes | `src/features/60-documentos/10-ata/logic.test.ts` | verificação-1 |
| CPR-60-20-00-200A | Documentos › PDF › Diagramação A4 da ata | `src/features/60-documentos/20-pdf/logic.ts` | verificação-1 |
| CPR-60-20-00-700A | Documentos › PDF › Testes | `src/features/60-documentos/20-pdf/logic.test.ts` | verificação-1 |
| CPR-60-30-00-200A | Documentos › Exportação › Transcrição em .txt e nome de arquivos | `src/features/60-documentos/30-exportacao/logic.ts` | verificação-1 |
| CPR-60-30-00-700A | Documentos › Exportação › Testes | `src/features/60-documentos/30-exportacao/logic.test.ts` | verificação-1 |
| CPR-80-00-00-000A | Integrações › Interface pública | `src/features/80-integracoes/index.ts` | verificação-1 |
| CPR-80-10-00-100A | Integrações › Claude › Contratos das capacidades do artifact | `src/features/80-integracoes/10-claude/schemas.ts` | verificação-1 |
| CPR-80-10-00-300A | Integrações › Claude › Adaptadores tipados de window.claude | `src/features/80-integracoes/10-claude/api.ts` | verificação-1 |
| CPR-80-10-00-700A | Integrações › Claude › Testes | `src/features/80-integracoes/10-claude/api.test.ts` | verificação-1 |
| CPR-90-10-00-900A | Infraestrutura › Build › Compila o app num único index.html | `scripts/build.mjs` | verificação-1 |
| CPR-90-20-00-900A | Infraestrutura › Estudo de eficiência › Executor | `scripts/bench.mjs` | verificação-1 |
| CPR-90-20-10-700A | Infraestrutura › Estudo de eficiência › Simulações e medições | `scripts/bench-entrada.ts` | verificação-1 |
| CPR-90-20-20-000A | Infraestrutura › Estudo de eficiência › Acesso ao código do app | `scripts/bench-api.ts` | verificação-1 |
| CPR-90-30-00-900A | Infraestrutura › CI › Verificação a cada push | `.github/workflows/ci.yml` | verificação-1 |

**Status:** `verificação-1` = BREX limpo, testes passando e revisão de mesa. `verificação-2` exige validação do dono do produto usando o sistema real (reunião de teste).
