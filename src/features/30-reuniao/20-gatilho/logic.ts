/**
 * DMC:    CPR-30-20-00-200A
 * Título: Reunião › Gatilho › Quando pedir sugestões ao Claude
 * BREX:   CPR-00-00-00-022A
 *
 * Regra: pedir sugestões após 3 s de silêncio com fala nova, ou a cada 60 s
 * no máximo enquanto houver fala nova. Nunca com chamada em andamento.
 */

export interface RegrasGatilho {
  readonly pausaMs: number;
  readonly cicloMs: number;
  readonly minChars: number;
}

export const REGRAS_PADRAO: RegrasGatilho = { pausaMs: 3000, cicloMs: 60000, minChars: 30 };

export interface EntradaGatilho {
  readonly agora: number;
  /** Último instante em que chegou fala (parcial ou final). */
  readonly ultimoSom: number;
  /** Último pedido de sugestões (ou início da escuta). */
  readonly ultimaChamada: number;
  /** Caracteres ainda não analisados pelo Claude. */
  readonly novosChars: number;
  /** Existe frase em andamento ainda não finalizada. */
  readonly temParcial: boolean;
  /** Pausa imposta após limite de uso (epoch ms). */
  readonly pausaAte: number;
  /** Escuta ativa, modo automático ligado, Claude disponível e livre. */
  readonly pronto: boolean;
}

export type MotivoGatilho = 'pausa' | 'ciclo' | null;

export function decidirGatilho(e: EntradaGatilho, r: RegrasGatilho = REGRAS_PADRAO): MotivoGatilho {
  if (r.pausaMs <= 0 || r.cicloMs <= r.pausaMs) throw new Error('Regras de gatilho inconsistentes.');
  if (!e.pronto || e.agora < e.pausaAte) return null;
  if (e.novosChars < r.minChars) return null;
  if (!e.temParcial && e.agora - e.ultimoSom >= r.pausaMs) return 'pausa';
  if (e.agora - e.ultimaChamada >= r.cicloMs) return 'ciclo';
  return null;
}
