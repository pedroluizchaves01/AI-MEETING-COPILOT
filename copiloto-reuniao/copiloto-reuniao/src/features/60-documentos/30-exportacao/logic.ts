/**
 * DMC:    CPR-60-30-00-200A
 * Título: Documentos › Exportação › Transcrição em .txt e nome de arquivos
 * BREX:   CPR-00-00-00-022A
 */
import { horaBR } from '../../../core/tempo';
import { formatarLinha, type Segmento } from '../../30-reuniao';
import type { MetaAta } from '../10-ata/schemas';

const PROIBIDOS = /[\\/:*?"<>|]+/g;

/** "Ata - Empresa - Título - 24-11-2026.pdf", sem caracteres inválidos no Windows. */
export function nomeArquivo(tipo: string, base: string, m: MetaAta, ext: 'pdf' | 'txt'): string {
  const empresa = m.empresa === '' ? '' : `${m.empresa} - `;
  const corpo = `${tipo} - ${empresa}${base === '' ? 'reunião' : base}`.replace(PROIBIDOS, '').slice(0, 110);
  return `${corpo} - ${m.data.replace(/\//g, '-')}.${ext}`;
}

/** Texto genérico (UTF-8, CRLF) que abre em qualquer editor. */
export function transcricaoTexto(segs: readonly Segmento[], inicio: number, m: MetaAta): string {
  if (segs.length === 0) throw new Error('Sem transcrição para exportar.');
  const sep = '='.repeat(60);
  const cab = [
    'TRANSCRIÇÃO DE REUNIÃO',
    sep,
    m.empresa && `Empresa: ${m.empresa}`,
    m.autor && `Autor: ${m.autor}`,
    m.objetivo && `Objetivo: ${m.objetivo}`,
    `Participantes: ${m.participantes}`,
    `Data: ${m.data}   Início: ${horaBR(inicio)}   Duração: ${m.duracao}`,
    'Observação: transcrição automática de um único microfone, sem identificação de quem fala; pode conter erros.',
    sep,
  ].filter((l) => l !== '');
  const corpo = segs.map((s) => formatarLinha(s, inicio, '(anotação manual)'));
  return [...cab, '', ...corpo].join('\r\n') + '\r\n';
}
