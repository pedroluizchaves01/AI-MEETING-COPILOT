/**
 * DMC:    CPR-30-10-00-100A
 * Título: Reunião › Transcrição › Tipos
 * BREX:   CPR-00-00-00-022A
 */

/** Um trecho de fala já reconhecido (frase final do ditado) ou uma anotação manual. */
export interface Segmento {
  /** Momento em que o trecho foi registrado (epoch ms). */
  readonly t: number;
  readonly texto: string;
  /** true quando o usuário digitou o trecho em vez de falar. */
  readonly manual: boolean;
}

/** Limites da janela de contexto enviada ao Claude. */
export const LIMITES_TRANSCRICAO = {
  /** Caracteres literais mais recentes enviados a cada sugestão. */
  janelaChars: 2800,
  /** Caracteres finais preservados fora do resumo contínuo. */
  caudaChars: 2000,
  /** Volume antigo que dispara a atualização do resumo. */
  gatilhoResumoChars: 4000,
  /** Acima disso a ata usa resumo + parte final em vez da transcrição inteira. */
  ataMaxChars: 60000,
} as const;
