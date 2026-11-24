/**
 * DMC:    CPR-80-10-00-100A
 * Título: Integrações › Claude › Contratos das capacidades do artifact
 * BREX:   CPR-00-00-00-022A
 *
 * Um artifact publicado no Claude acessa recursos da plataforma por
 * `window.claude.use(nome)`. Este app declara três capacidades:
 *   dictation  → voz do usuário em texto (parcial e final)
 *   sample     → pedir uma resposta ao Claude (sem memória entre chamadas)
 *   downloads  → oferecer um arquivo gerado na página para o usuário salvar
 * `use()` devolve null quando a visualização não oferece o recurso.
 */

export interface EventoTexto {
  readonly text: string;
}

export interface EventoEstado {
  readonly state: string;
  readonly reason?: string;
}

export interface Ditado {
  start(): Promise<void>;
  stop(): Promise<void>;
  onPartial(cb: (e: EventoTexto) => void): void;
  onFinal(cb: (e: EventoTexto) => void): void;
  onState(cb: (e: EventoEstado) => void): void;
}

export interface OpcoesSample {
  readonly modelTier?: 'quick' | 'default' | 'complex';
  readonly signal?: AbortSignal;
  readonly cache?: boolean;
}

export interface Sample {
  (entrada: string, opcoes?: OpcoesSample): Promise<{ readonly text: string }>;
  json?: (entrada: string, opcoes?: OpcoesSample) => Promise<unknown>;
}

export interface Downloads {
  save(pedido: { readonly filename: string; readonly data: string | Blob }): Promise<unknown>;
}

export interface Capacidades {
  readonly ditado: Ditado | null;
  readonly sample: Sample | null;
  readonly downloads: Downloads | null;
}

/** Códigos de erro tratados pela interface. Outros viram "falha". */
export type CodigoErro =
  | 'not_granted'
  | 'rate_limited'
  | 'declined'
  | 'host_unavailable'
  | 'abortado'
  | 'falha';
