/**
 * DMC:    CPR-60-10-00-100A
 * Título: Documentos › Ata › Tipos
 * BREX:   CPR-00-00-00-022A
 */

export interface InformacaoAta {
  readonly tema: string;
  readonly detalhe: string;
}

export interface PendenciaAta {
  readonly item: string;
  readonly responsavel: string;
  readonly prazo: string;
}

/** Conteúdo da ata, redigido pelo Claude a partir da transcrição. */
export interface Ata {
  readonly titulo: string;
  readonly resumo: string;
  readonly informacoes: readonly InformacaoAta[];
  readonly decisoes: readonly string[];
  readonly pendencias: readonly PendenciaAta[];
  readonly perguntasAbertas: readonly string[];
  readonly proximosPassos: readonly string[];
}

/** Dados da reunião que vêm do contexto e do relógio, não do Claude. */
export interface MetaAta {
  readonly empresa: string;
  readonly autor: string;
  readonly objetivo: string;
  readonly participantes: string;
  readonly data: string;
  readonly duracao: string;
}
