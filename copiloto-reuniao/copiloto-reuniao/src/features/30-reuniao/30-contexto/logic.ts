/**
 * DMC:    CPR-30-30-00-200A
 * Título: Reunião › Contexto › Dados informados antes da reunião
 * BREX:   CPR-00-00-00-022A
 */

/** O que o usuário preenche antes de começar. Empresa e autor personalizam a ata. */
export interface Contexto {
  readonly empresa: string;
  readonly autor: string;
  readonly objetivo: string;
  readonly participantes: string;
  readonly pauta: string;
}

export const CAMPOS_CONTEXTO = ['empresa', 'autor', 'objetivo', 'participantes', 'pauta'] as const;

/** Descreve quem conduz a reunião, para os prompts. */
export function quemConduz(ctx: Contexto): string {
  const autor = ctx.autor.trim() || 'o profissional que conduz a reunião';
  const empresa = ctx.empresa.trim();
  return empresa === '' ? autor : `${autor} (empresa ${empresa})`;
}

/** Lista de participantes com o autor no final, sem repetir vazios. */
export function participantesComAutor(ctx: Contexto): string {
  const lista = [ctx.participantes.trim(), ctx.autor.trim()].filter((p) => p !== '');
  return lista.length === 0 ? '—' : lista.join('; ');
}
