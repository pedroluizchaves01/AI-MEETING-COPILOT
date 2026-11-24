/**
 * DMC:    CPR-40-10-00-200A
 * Título: Sugestões › Perguntas › Prompt e normalização da resposta
 * BREX:   CPR-00-00-00-022A
 */
import { quemConduz, type Contexto } from '../../30-reuniao';
import { LIMITES_SUGESTOES, type Sugestao } from './schemas';

export interface EntradaPrompt {
  readonly ctx: Contexto;
  readonly resumo: string;
  readonly recente: string;
  readonly anteriores: readonly string[];
  readonly feitas: readonly string[];
}

const ou = (v: string, padrao: string): string => (v.trim() === '' ? padrao : v);

export function montarPromptSugestoes(e: EntradaPrompt): string {
  if (e.recente.trim() === '') throw new Error('Sem trecho recente para analisar.');
  const anteriores = e.anteriores.slice(-LIMITES_SUGESTOES.historicoNoPrompt);
  return `Você é o copiloto de ${quemConduz(e.ctx)} numa reunião presencial com cliente. A transcrição vem de um único microfone, sem identificar quem fala, e pode ter erros de reconhecimento de voz.

Objetivo da reunião: ${ou(e.ctx.objetivo, '(não informado)')}
Participantes: ${ou(e.ctx.participantes, '(não informado)')}
Pontos que ele(a) precisa esclarecer: ${ou(e.ctx.pauta, '(não informado)')}

Resumo do que já foi conversado antes:
${ou(e.resumo, '(início da reunião)')}

Trecho mais recente (literal):
${e.recente}

Perguntas já sugeridas antes (não repita nem reformule):
${ou(anteriores.join('\n'), '(nenhuma)')}
Perguntas que ele(a) já fez:
${ou(e.feitas.join('\n'), '(nenhuma)')}

Tarefa: sugira de 0 a 3 perguntas curtas, diretas e naturais de falar, que quem conduz a reunião deveria fazer AGORA, ligadas ao que acabou de ser dito. Priorize lacunas: necessidades e expectativas do cliente, escopo, orçamento, prazos, quem decide, restrições e riscos, critérios de sucesso e os pontos da pauta ainda não abordados. Adapte as perguntas ao ramo da empresa e ao objetivo da reunião. Não sugira nada que já foi respondido na conversa. Se nada for realmente útil, devolva a lista vazia.
Responda apenas com JSON: {"perguntas":[{"pergunta":"...","motivo":"por que perguntar, até 12 palavras","tema":"1 ou 2 palavras"}]}`;
}

const texto = (v: unknown, max: number): string => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function listaBruta(v: unknown): readonly unknown[] {
  if (Array.isArray(v)) return v;
  if (typeof v === 'object' && v !== null && 'perguntas' in v && Array.isArray(v.perguntas)) {
    return v.perguntas;
  }
  return [];
}

/** Normaliza a resposta do Claude: aceita só itens com pergunta, corta excessos, nunca lança. */
export function normalizarSugestoes(v: unknown, lote: number, jaVistas: readonly string[]): Sugestao[] {
  const vistas = new Set(jaVistas.map((p) => p.trim().toLowerCase()));
  const saida: Sugestao[] = [];
  for (const item of listaBruta(v).slice(0, 10)) {
    if (typeof item !== 'object' || item === null) continue;
    const pergunta = 'pergunta' in item ? texto(item.pergunta, 300) : '';
    if (pergunta === '' || vistas.has(pergunta.toLowerCase())) continue;
    vistas.add(pergunta.toLowerCase());
    saida.push({
      id: `${lote}-${saida.length}`,
      lote,
      t: lote,
      pergunta,
      motivo: 'motivo' in item ? texto(item.motivo, 160) : '',
      tema: 'tema' in item ? texto(item.tema, 30) : '',
      destino: 'pendente',
    });
    if (saida.length >= LIMITES_SUGESTOES.porLote) break;
  }
  return saida;
}

/** Novo lote entra no topo; a ordem dentro do lote é preservada. */
export function empilhar(atuais: readonly Sugestao[], novas: readonly Sugestao[]): Sugestao[] {
  return [...novas, ...atuais];
}

export function marcar(lista: readonly Sugestao[], id: string, destino: Sugestao['destino']): Sugestao[] {
  return lista.map((s) => (s.id === id ? { ...s, destino } : s));
}
