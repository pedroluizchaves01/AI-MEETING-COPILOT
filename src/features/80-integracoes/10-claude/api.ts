/**
 * DMC:    CPR-80-10-00-300A
 * Título: Integrações › Claude › Adaptadores tipados de window.claude
 * BREX:   CPR-00-00-00-022A
 */
import type { Capacidades, CodigoErro, Ditado, Downloads, OpcoesSample, Sample } from './schemas';

declare global {
  interface Window {
    claude?: { use(nome: string): Promise<unknown> };
  }
}

function temMetodo(x: unknown, nome: string): boolean {
  return typeof x === 'object' && x !== null && nome in x && typeof Reflect.get(x, nome) === 'function';
}
function ehDitado(x: unknown): x is Ditado {
  return ['start', 'stop', 'onPartial', 'onFinal', 'onState'].every((n) => temMetodo(x, n));
}
function ehSample(x: unknown): x is Sample {
  return typeof x === 'function';
}
function ehDownloads(x: unknown): x is Downloads {
  return temMetodo(x, 'save');
}

async function usar(nome: string): Promise<unknown> {
  const plataforma = window.claude;
  if (plataforma === undefined || typeof plataforma.use !== 'function') return null;
  try {
    return await plataforma.use(nome);
  } catch {
    return null;
  }
}

/** Resolve as três capacidades em paralelo; cada uma pode vir null. */
export async function carregarCapacidades(): Promise<Capacidades> {
  const [d, s, dl] = await Promise.all([usar('dictation'), usar('sample'), usar('downloads')]);
  return {
    ditado: ehDitado(d) ? d : null,
    sample: ehSample(s) ? s : null,
    downloads: ehDownloads(dl) ? dl : null,
  };
}

/** Extrai o primeiro objeto JSON de um texto, ou null. */
export function lerJSON(texto: string): unknown {
  try {
    return JSON.parse(texto);
  } catch {
    const m = /\{[\s\S]*\}/.exec(texto);
    if (m === null) return null;
    try {
      return JSON.parse(m[0]);
    } catch {
      return null;
    }
  }
}

/** Pede JSON ao Claude; usa sample.json quando existe, senão interpreta o texto. */
export async function pedirJSON(sample: Sample, prompt: string, opcoes: OpcoesSample): Promise<unknown> {
  if (typeof sample.json === 'function') return sample.json(prompt, opcoes);
  const r = await sample(prompt, opcoes);
  return lerJSON(r.text);
}

const CONHECIDOS: readonly CodigoErro[] = ['not_granted', 'rate_limited', 'declined', 'host_unavailable'];

/** Traduz qualquer erro da plataforma para um código conhecido. */
export function codigoErro(e: unknown): CodigoErro {
  if (e instanceof DOMException && e.name === 'AbortError') return 'abortado';
  if (typeof e !== 'object' || e === null) return 'falha';
  const bruto: unknown = Reflect.get(e, 'code') ?? Reflect.get(e, 'message');
  const texto = typeof bruto === 'string' ? bruto : '';
  return CONHECIDOS.find((c) => texto.includes(c)) ?? 'falha';
}
