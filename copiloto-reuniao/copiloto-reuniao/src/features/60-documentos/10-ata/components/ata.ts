/**
 * DMC:    CPR-60-10-00-400A
 * Título: Documentos › Ata › Visualização na tela
 * BREX:   CPR-00-00-00-022A
 */
import { esc } from '../../../../core/dom';
import { tituloDaAta } from '../logic';
import type { Ata, MetaAta } from '../schemas';

const lista = (itens: readonly string[], tag: 'ul' | 'ol'): string =>
  `<${tag}>${itens.map((x) => `<li>${esc(x)}</li>`).join('')}</${tag}>`;

const tabela = (cls: string, cab: readonly string[], linhas: readonly (readonly string[])[], negrito = false): string =>
  `<table class="${cls}"><tr>${cab.map((c) => `<th>${esc(c)}</th>`).join('')}</tr>${linhas
    .map(
      (l) =>
        `<tr>${l.map((c, i) => `<td>${negrito && i === 0 ? `<strong>${esc(c)}</strong>` : esc(c)}</td>`).join('')}</tr>`,
    )
    .join('')}</table>`;

export function ataHTML(a: Ata, m: MetaAta): string {
  const partes: string[] = [
    `<h3>${esc(tituloDaAta(a, m))}</h3>`,
    `<div class="mt"><span>${esc(m.data)}</span><span>${esc(m.duracao)}</span><span>${esc(m.participantes)}</span></div>`,
  ];
  if (a.resumo !== '') partes.push(`<div class="res">${esc(a.resumo)}</div>`);
  if (a.informacoes.length > 0) {
    const linhas = a.informacoes.map((i) => [i.tema, i.detalhe]);
    partes.push('<h4>Informações levantadas</h4>', tabela('kv', ['Tema', 'Detalhe'], linhas, true));
  }
  if (a.decisoes.length > 0) partes.push('<h4>Decisões</h4>', lista(a.decisoes, 'ol'));
  if (a.pendencias.length > 0) {
    const linhas = a.pendencias.map((p) => [p.item, p.responsavel, p.prazo]);
    partes.push('<h4>Pendências</h4>', tabela('pd', ['Item', 'Responsável', 'Prazo'], linhas));
  }
  if (a.perguntasAbertas.length > 0) partes.push('<h4>Perguntas em aberto</h4>', lista(a.perguntasAbertas, 'ul'));
  if (a.proximosPassos.length > 0) partes.push('<h4>Próximos passos</h4>', lista(a.proximosPassos, 'ul'));
  return partes.join('');
}
