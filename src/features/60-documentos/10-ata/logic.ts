/**
 * DMC:    CPR-60-10-00-200A
 * Título: Documentos › Ata › Prompt, validação e versão em texto
 * BREX:   CPR-00-00-00-022A
 */
import { dataBR, duracaoMin } from '../../../core/tempo';
import { participantesComAutor, quemConduz, type Contexto } from '../../30-reuniao';
import type { Ata, InformacaoAta, MetaAta, PendenciaAta } from './schemas';

export function montarMeta(ctx: Contexto, inicio: number, fim: number): MetaAta {
  if (inicio <= 0 || fim < inicio) throw new Error('Intervalo da reunião inválido.');
  return {
    empresa: ctx.empresa.trim(),
    autor: ctx.autor.trim(),
    objetivo: ctx.objetivo.trim(),
    participantes: participantesComAutor(ctx),
    data: dataBR(inicio),
    duracao: duracaoMin(inicio, fim),
  };
}

export function montarPromptAta(ctx: Contexto, m: MetaAta, corpo: string): string {
  if (corpo.trim() === '') throw new Error('Sem transcrição para a ata.');
  return `Redija a ata de uma reunião presencial conduzida por ${quemConduz(ctx)} com o cliente. Português do Brasil, tom formal, frases curtas e objetivas.
Objetivo: ${m.objetivo || '-'} | Participantes: ${m.participantes} | Data: ${m.data} | Duração: ${m.duracao}
Use só o que está na transcrição (um único microfone, sem identificar quem fala, pode ter erros de reconhecimento). Acrescente "(confirmar)" ao que estiver ambíguo. Não invente responsáveis nem prazos: use "—" quando não forem citados.
Responda apenas com JSON neste formato:
{"titulo":"título curto e específico da reunião","resumo":"um parágrafo de 3 a 5 frases","informacoes":[{"tema":"1 a 3 palavras","detalhe":"..."}],"decisoes":["..."],"pendencias":[{"item":"...","responsavel":"...","prazo":"..."}],"perguntas_abertas":["..."],"proximos_passos":["..."]}

Transcrição:
${corpo}`;
}

const MAX_ITENS = 40;
const txt = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
const campo = (o: object, k: string): unknown => (k in o ? Object.getOwnPropertyDescriptor(o, k)?.value : undefined);
const objetos = (v: unknown): object[] =>
  Array.isArray(v) ? v.slice(0, MAX_ITENS).filter((x): x is object => typeof x === 'object' && x !== null) : [];
const textos = (v: unknown): string[] =>
  Array.isArray(v) ? v.slice(0, MAX_ITENS).map(txt).filter((s) => s !== '') : [];

/** Valida a resposta do Claude. Devolve null se não houver nada aproveitável. */
export function normalizarAta(v: unknown): Ata | null {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return null;
  const informacoes: InformacaoAta[] = objetos(campo(v, 'informacoes'))
    .map((o) => ({ tema: txt(campo(o, 'tema')), detalhe: txt(campo(o, 'detalhe')) }))
    .filter((i) => i.detalhe !== '');
  const pendencias: PendenciaAta[] = objetos(campo(v, 'pendencias'))
    .map((o) => ({
      item: txt(campo(o, 'item')),
      responsavel: txt(campo(o, 'responsavel')) || '—',
      prazo: txt(campo(o, 'prazo')) || '—',
    }))
    .filter((p) => p.item !== '');
  const ata: Ata = {
    titulo: txt(campo(v, 'titulo')),
    resumo: txt(campo(v, 'resumo')),
    informacoes,
    decisoes: textos(campo(v, 'decisoes')),
    pendencias,
    perguntasAbertas: textos(campo(v, 'perguntas_abertas')),
    proximosPassos: textos(campo(v, 'proximos_passos')),
  };
  const vazia = ata.resumo === '' && informacoes.length + pendencias.length + ata.decisoes.length === 0;
  return vazia ? null : ata;
}

export const tituloDaAta = (a: Ata, m: MetaAta): string => a.titulo || m.objetivo || 'Ata de reunião';

/** Versão em texto simples, para copiar e colar. */
export function ataTexto(a: Ata, m: MetaAta): string {
  const linhas: string[] = [
    tituloDaAta(a, m).toUpperCase(),
    `${m.empresa === '' ? '' : `${m.empresa} · `}${m.data} · ${m.duracao}`,
    `Participantes: ${m.participantes}`,
  ];
  const secao = (nome: string, itens: readonly string[]): void => {
    if (itens.length > 0) linhas.push('', nome, ...itens);
  };
  if (a.resumo !== '') linhas.push('', 'RESUMO', a.resumo);
  secao('INFORMAÇÕES LEVANTADAS', a.informacoes.map((i) => `- ${i.tema}: ${i.detalhe}`));
  secao('DECISÕES', a.decisoes.map((d, i) => `${i + 1}. ${d}`));
  secao('PENDÊNCIAS', a.pendencias.map((p) => `- ${p.item} (resp.: ${p.responsavel}; prazo: ${p.prazo})`));
  secao('PERGUNTAS EM ABERTO', a.perguntasAbertas.map((p) => `- ${p}`));
  secao('PRÓXIMOS PASSOS', a.proximosPassos.map((p) => `[ ] ${p}`));
  return linhas.join('\n') + '\n';
}
