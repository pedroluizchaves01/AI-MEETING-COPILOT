/**
 * DMC:    CPR-40-00-00-000A
 * Título: Sugestões › Interface pública
 * BREX:   CPR-00-00-00-022A
 */
export type { Sugestao } from './10-perguntas/schemas';
export { LIMITES_SUGESTOES } from './10-perguntas/schemas';
export { montarPromptSugestoes, normalizarSugestoes, empilhar, marcar } from './10-perguntas/logic';
export type { EntradaPrompt } from './10-perguntas/logic';
export { montarPromptResumo, LIMITE_RESUMO_PALAVRAS } from './20-resumo/logic';
export { renderCartoes, renderFeitas } from './30-cartoes/components/cartoes';
