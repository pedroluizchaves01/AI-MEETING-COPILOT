/**
 * DMC:    CPR-30-00-00-000A
 * Título: Reunião › Interface pública
 * BREX:   CPR-00-00-00-022A
 */
export type { Segmento } from './10-transcricao/schemas';
export { LIMITES_TRANSCRICAO } from './10-transcricao/schemas';
export {
  novoSegmento,
  formatarLinha,
  textoDe,
  contarNovos,
  janelaRecente,
  trechoParaResumir,
  corpoParaAta,
} from './10-transcricao/logic';
export type { RegrasGatilho, EntradaGatilho, MotivoGatilho } from './20-gatilho/logic';
export { REGRAS_PADRAO, decidirGatilho } from './20-gatilho/logic';
export type { Contexto } from './30-contexto/logic';
export { CAMPOS_CONTEXTO, quemConduz, participantesComAutor } from './30-contexto/logic';
