/**
 * DMC:    CPR-40-30-00-400A
 * Título: Sugestões › Cartões › Lista animada (mais recente no topo)
 * BREX:   CPR-00-00-00-022A
 */
import { esc } from '../../../../core/dom';
import { mmss } from '../../../../core/tempo';
import { LIMITES_SUGESTOES, type Sugestao } from '../../10-perguntas/schemas';

const VAZIO =
  '<div class="vazio">Nenhuma sugestão pendente. Continue a conversa ou toque em “Sugerir agora”.</div>';
const ENTRADA: Keyframe[] = [
  { opacity: 0, transform: 'translateY(-24px) scale(.97)' },
  { opacity: 1, transform: 'none' },
];
const CURVA = 'cubic-bezier(.2,.8,.2,1)';

/** "nova" = lote mais recente; "velha" = do terceiro lote em diante. */
function classe(s: Sugestao, loteAtual: number, lotes: readonly number[]): string {
  if (s.lote === loteAtual) return ' nova';
  return lotes.indexOf(s.lote) >= 2 ? ' velha' : '';
}

function cartaoHTML(s: Sugestao, cls: string, inicio: number): string {
  const tema = s.tema === '' ? '' : `<span class="chip">${esc(s.tema)}</span>`;
  return `<article class="card${cls}" data-id="${esc(s.id)}">
    <p class="q">${esc(s.pergunta)}</p>
    <div class="meta">${tema}<span>${esc(s.motivo)}</span><span>${mmss(s.t - (inicio || s.t))}</span></div>
    <div class="acts"><button data-a="feita">Já perguntei</button><button data-a="descartada">Descartar</button></div></article>`;
}

function posicoes(box: HTMLElement): Map<string, number> {
  const mapa = new Map<string, number>();
  box.querySelectorAll<HTMLElement>('.card').forEach((c) => {
    mapa.set(c.dataset['id'] ?? '', c.getBoundingClientRect().top);
  });
  return mapa;
}

/** FLIP: cartões novos entram de cima; os antigos deslizam até a nova posição. */
function animar(box: HTMLElement, antes: Map<string, number>): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  box.querySelectorAll<HTMLElement>('.card').forEach((c, i) => {
    if (typeof c.animate !== 'function') return;
    const topo = antes.get(c.dataset['id'] ?? '');
    if (topo === undefined) {
      c.animate(ENTRADA, { duration: 450, delay: i * 70, easing: CURVA, fill: 'backwards' });
      return;
    }
    const dy = topo - c.getBoundingClientRect().top;
    if (dy !== 0) c.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 450, easing: CURVA });
  });
}

export function renderCartoes(box: HTMLElement, todas: readonly Sugestao[], loteAtual: number, inicio: number): void {
  const pendentes = todas.filter((s) => s.destino === 'pendente').slice(0, LIMITES_SUGESTOES.visiveis);
  const antes = posicoes(box);
  const lotes = [...new Set(pendentes.map((s) => s.lote))];
  box.innerHTML =
    pendentes.length === 0 ? VAZIO : pendentes.map((s) => cartaoHTML(s, classe(s, loteAtual, lotes), inicio)).join('');
  animar(box, antes);
}

export function renderFeitas(lista: HTMLElement, todas: readonly Sugestao[]): void {
  const feitas = todas.filter((s) => s.destino === 'feita').slice(0, 8);
  lista.innerHTML =
    feitas.length === 0
      ? ''
      : '<li><strong>Já perguntadas:</strong></li>' + feitas.map((s) => `<li>${esc(s.pergunta)}</li>`).join('');
}
