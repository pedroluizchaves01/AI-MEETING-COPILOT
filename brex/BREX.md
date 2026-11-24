# BREX do projeto (CPR-00-00-00-022A)

Regras de código do Copiloto de Reunião. Camada base: método `/dev` (S1000D + Power of 10 adaptado a TypeScript). Este BREX só acrescenta ou restringe.

**Severidade:** S1 bloqueante · S2 obrigatória com exceção justificada · S3 recomendação.
**Como verificar:** `npm run brex` (= `tsc --noEmit` + ESLint sem avisos + dependency-cruiser + check-dmc).

| ID | Regra | Sev. | Verificação |
|---|---|---|---|
| P10-01 | Fluxo simples: sem recursão, `label`, `with` ou expressões com vírgula | S1 | ESLint |
| P10-02 | Todo laço tem limite (tamanho da lista ou máximo explícito) | S1 | ESLint + revisão |
| P10-03 | Memória limitada: até 5.000 falas e 500 sugestões persistidas; prompt com janela e resumo | S1 | Revisão + testes |
| P10-04 | Funções ≤ 60 linhas, complexidade ≤ 10, aninhamento ≤ 3, até 4 parâmetros; arquivos ≤ 300 linhas | S2 | ESLint |
| P10-05 | Respostas do Claude e dados do localStorage sempre validados; funções de domínio com pré-condições | S1 | Testes |
| P10-06 | `const`, sem `var`; estado mutável só na instância de `Sessao` | S1 | ESLint + revisão |
| P10-07 | Nenhuma Promise solta; `switch` exaustivo; erros da plataforma traduzidos por `codigoErro` | S1 | typescript-eslint |
| P10-08 | Sem `eval`, `new Function` ou acesso dinâmico não tipado | S1 | ESLint |
| P10-09 | Sem `any` e sem `as` (exceto `as const`); dados de domínio `readonly` | S1 | ESLint |
| P10-10 | Zero avisos; `npm run verificar` antes de cada commit e no CI | S1 | CI |
| CPR-01 | Texto vindo do Claude ou do usuário entra no HTML só por `esc()` ou `textContent` | S1 | Revisão |
| CPR-02 | Sistemas só se importam pelo `index.ts`; `core/` não importa sistemas; sistemas não importam `app/` | S1 | dependency-cruiser |
| CPR-03 | `dictation.start()` é chamado direto no clique, sem `await` antes | S1 | Revisão |
| CPR-04 | Todo arquivo tem cabeçalho DMC listado na DMRL | S1 | check-dmc |

## Exceções registradas

| Regra | Onde | Motivo |
|---|---|---|
| P10-09 (`no-param-reassign` só para a variável, não para propriedades) | `src/app/` | Os fluxos atualizam a instância única de `Sessao` recebida como parâmetro (`app.s.dados`). As funções de domínio continuam puras. |
| P10-04 (testes) | `src/**/*.test.ts` | Blocos `describe` longos são aceitos em testes. |
