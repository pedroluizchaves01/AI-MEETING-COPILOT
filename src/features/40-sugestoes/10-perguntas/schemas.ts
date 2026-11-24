/**
 * DMC:    CPR-40-10-00-100A
 * Título: Sugestões › Perguntas › Tipos
 * BREX:   CPR-00-00-00-022A
 */

export interface Sugestao {
  readonly id: string;
  /** Instante do pedido que gerou a sugestão; agrupa as perguntas de um mesmo ciclo. */
  readonly lote: number;
  readonly t: number;
  readonly pergunta: string;
  readonly motivo: string;
  readonly tema: string;
  /** "feita" quando o usuário já perguntou; "descartada" quando dispensou. */
  readonly destino: 'pendente' | 'feita' | 'descartada';
}

export const LIMITES_SUGESTOES = {
  porLote: 3,
  /** Perguntas anteriores enviadas ao Claude para evitar repetição. */
  historicoNoPrompt: 25,
  /** Cartões visíveis ao mesmo tempo. */
  visiveis: 14,
} as const;
