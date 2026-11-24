/**
 * DMC:    CPR-30-10-00-200A
 * Título: Reunião › Transcrição › Lógica de segmentos, janela e cortes
 * BREX:   CPR-00-00-00-022A
 */
import { mmss } from '../../../core/tempo';
import { LIMITES_TRANSCRICAO, type Segmento } from './schemas';

/** Cria um segmento válido ou devolve null para texto vazio. */
export function novoSegmento(texto: string, t: number, manual: boolean): Segmento | null {
  const limpo = texto.trim();
  if (limpo === '') return null;
  if (!Number.isFinite(t) || t <= 0) throw new Error('Instante do segmento inválido.');
  return { t, texto: limpo, manual };
}

/** Uma linha "[mm:ss] texto" relativa ao início da reunião. */
export function formatarLinha(s: Segmento, inicio: number, rotuloManual = '(anotação)'): string {
  const prefixo = s.manual ? `${rotuloManual} ` : '';
  return `[${mmss(s.t - inicio)}] ${prefixo}${s.texto}`;
}

/** Texto corrido dos segmentos no intervalo [de, ate). */
export function textoDe(
  segs: readonly Segmento[],
  inicio: number,
  de = 0,
  ate: number = segs.length,
): string {
  return segs
    .slice(de, ate)
    .map((s) => formatarLinha(s, inicio))
    .join('\n');
}

/** Quantos caracteres novos existem desde o índice `desde`, incluindo a fala parcial. */
export function contarNovos(segs: readonly Segmento[], desde: number, parcial: string): number {
  let total = parcial.trim().length;
  for (let i = Math.max(0, desde); i < segs.length; i++) {
    total += segs[i]?.texto.length ?? 0;
  }
  return total;
}

/**
 * Índice a partir do qual os segmentos somam pelo menos `limite` caracteres,
 * sem recuar além de `minimo`. Laço limitado pelo tamanho da lista (P10-02).
 */
export function inicioDaCauda(segs: readonly Segmento[], minimo: number, limite: number): number {
  let soma = 0;
  let i = segs.length;
  while (i > minimo && soma < limite) {
    i--;
    soma += segs[i]?.texto.length ?? 0;
  }
  return i;
}

/** Janela literal recente para o prompt de sugestões, com a fala parcial ao final. */
export function janelaRecente(
  segs: readonly Segmento[],
  inicio: number,
  resumidoAte: number,
  parcial: string,
): string {
  const de = inicioDaCauda(segs, resumidoAte, LIMITES_TRANSCRICAO.janelaChars);
  const p = parcial.trim();
  const corpo = textoDe(segs, inicio, de);
  return p === '' ? corpo : `${corpo}\n[agora] ${p}`;
}

/** Trecho antigo que deve entrar no resumo, ou null se ainda não vale a pena resumir. */
export function trechoParaResumir(
  segs: readonly Segmento[],
  inicio: number,
  resumidoAte: number,
): { readonly texto: string; readonly ate: number } | null {
  const ate = inicioDaCauda(segs, resumidoAte, LIMITES_TRANSCRICAO.caudaChars);
  const texto = textoDe(segs, inicio, resumidoAte, ate);
  if (texto.length < LIMITES_TRANSCRICAO.gatilhoResumoChars) return null;
  return { texto, ate };
}

/** Corpo para a ata: transcrição inteira ou resumo + parte final quando muito longa. */
export function corpoParaAta(
  segs: readonly Segmento[],
  inicio: number,
  resumo: string,
  resumidoAte: number,
): string {
  const inteira = textoDe(segs, inicio);
  if (inteira.length <= LIMITES_TRANSCRICAO.ataMaxChars) return inteira;
  return `Resumo do início:\n${resumo}\n\nTranscrição final:\n${textoDe(segs, inicio, resumidoAte)}`;
}
