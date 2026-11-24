/**
 * DMC:    CPR-00-60-00-200A
 * Título: Núcleo › Aplicação › Estado da sessão e persistência
 * BREX:   CPR-00-00-00-022A
 *
 * O estado vive numa única instância criada em main.ts (sem global mutável).
 * É salvo no localStorage do navegador para sobreviver a um recarregamento
 * da página no meio da reunião. Nada sai do dispositivo por aqui.
 */
import { gravar, ler } from '../core/armazenamento';
import { normalizarAta, type Ata } from '../features/60-documentos';
import type { Segmento } from '../features/30-reuniao';
import type { Sugestao } from '../features/40-sugestoes';

const CHAVE = 'cpr_sessao_v1';
const MAX_SEGMENTOS = 5000;
const MAX_SUGESTOES = 500;

export interface Persistido {
  segs: Segmento[];
  sugestoes: Sugestao[];
  resumo: string;
  resumidoAte: number;
  analisadoAte: number;
  inicio: number;
  loteAtual: number;
  ataBruta: unknown;
}

const vazio = (): Persistido => ({
  segs: [], sugestoes: [], resumo: '', resumidoAte: 0, analisadoAte: 0, inicio: 0, loteAtual: 0, ataBruta: null,
});

const num = (o: object, k: string): number => {
  const v: unknown = Reflect.get(o, k);
  return typeof v === 'number' && Number.isFinite(v) ? v : 0;
};
const str = (o: object, k: string): string => {
  const v: unknown = Reflect.get(o, k);
  return typeof v === 'string' ? v : '';
};
const objs = (v: unknown, max: number): object[] =>
  Array.isArray(v) ? v.slice(0, max).filter((x): x is object => typeof x === 'object' && x !== null) : [];

function segmentos(v: unknown): Segmento[] {
  return objs(v, MAX_SEGMENTOS)
    .map((o) => ({ t: num(o, 't'), texto: str(o, 'texto'), manual: Reflect.get(o, 'manual') === true }))
    .filter((s) => s.t > 0 && s.texto !== '');
}

function sugestoes(v: unknown): Sugestao[] {
  const destinos: readonly Sugestao['destino'][] = ['pendente', 'feita', 'descartada'];
  return objs(v, MAX_SUGESTOES)
    .map((o) => {
      const d = str(o, 'destino');
      return {
        id: str(o, 'id'), lote: num(o, 'lote'), t: num(o, 't'), pergunta: str(o, 'pergunta'),
        motivo: str(o, 'motivo'), tema: str(o, 'tema'), destino: destinos.find((x) => x === d) ?? 'pendente',
      };
    })
    .filter((s) => s.id !== '' && s.pergunta !== '');
}

/** Lê e valida o que estava salvo; qualquer inconsistência vira sessão vazia. */
export function restaurar(): Persistido {
  const v = ler(CHAVE);
  if (typeof v !== 'object' || v === null) return vazio();
  const segs = segmentos(Reflect.get(v, 'segs'));
  return {
    segs,
    sugestoes: sugestoes(Reflect.get(v, 'sugestoes')),
    resumo: str(v, 'resumo'),
    resumidoAte: Math.min(num(v, 'resumidoAte'), segs.length),
    analisadoAte: Math.min(num(v, 'analisadoAte'), segs.length),
    inicio: num(v, 'inicio'),
    loteAtual: num(v, 'loteAtual'),
    ataBruta: Reflect.get(v, 'ataBruta') ?? null,
  };
}

export class Sessao {
  dados: Persistido = restaurar();
  ouvindo = false;
  ocupado = false;
  ultimaChamada = 0;
  ultimoSom = 0;
  pausaAte = 0;
  controle: AbortController | null = null;

  get ata(): Ata | null {
    return normalizarAta(this.dados.ataBruta);
  }
  salvar(): void {
    gravar(CHAVE, this.dados);
  }
  limpar(): void {
    this.dados = vazio();
    this.salvar();
  }
}
