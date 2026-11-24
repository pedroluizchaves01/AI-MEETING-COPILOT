/**
 * DMC:    CPR-00-60-10-400A
 * Título: Núcleo › Aplicação › Referências da interface e avisos
 * BREX:   CPR-00-00-00-022A
 */
import { el, esc } from '../core/dom';
import { lerTexto, gravar } from '../core/armazenamento';
import { mmss } from '../core/tempo';
import { CAMPOS_CONTEXTO, formatarLinha, type Contexto, type Segmento } from '../features/30-reuniao';
import type { Capacidades } from '../features/80-integracoes';
import type { Sessao } from './sessao';

export function obterElementos() {
  return {
    mic: el('mic', HTMLButtonElement),
    estado: el('estado', HTMLElement),
    relogio: el('relogio', HTMLElement),
    auto: el('auto', HTMLInputElement),
    agora: el('agora', HTMLButtonElement),
    gerarAta: el('gerarAta', HTMLButtonElement),
    limpar: el('limpar', HTMLButtonElement),
    aviso: el('aviso', HTMLElement),
    ctxBox: el('ctxBox', HTMLDetailsElement),
    pensando: el('pensando', HTMLElement),
    sugs: el('sugs', HTMLElement),
    feitas: el('feitas', HTMLElement),
    linhas: el('linhas', HTMLElement),
    parcial: el('parcial', HTMLElement),
    nota: el('nota', HTMLFormElement),
    notaIn: el('notaIn', HTMLInputElement),
    copTx: el('copTx', HTMLButtonElement),
    txtTx: el('txtTx', HTMLButtonElement),
    ata: el('ata', HTMLElement),
    ataTxt: el('ataTxt', HTMLElement),
    copAta: el('copAta', HTMLButtonElement),
    pdfAta: el('pdfAta', HTMLButtonElement),
    campos: {
      empresa: el('emp', HTMLInputElement),
      autor: el('autor', HTMLInputElement),
      objetivo: el('obj', HTMLInputElement),
      participantes: el('part', HTMLInputElement),
      pauta: el('pauta', HTMLTextAreaElement),
    },
  };
}

export type Elementos = ReturnType<typeof obterElementos>;

/** Tudo o que os fluxos precisam, montado uma vez em main.ts. */
export interface App {
  readonly s: Sessao;
  readonly ui: Elementos;
  caps: Capacidades;
}

export function aviso(app: App, texto: string, erro = false): void {
  app.ui.aviso.textContent = texto;
  app.ui.aviso.className = erro ? 'err' : '';
}

export function contexto(app: App): Contexto {
  const c = app.ui.campos;
  return {
    empresa: c.empresa.value, autor: c.autor.value, objetivo: c.objetivo.value,
    participantes: c.participantes.value, pauta: c.pauta.value,
  };
}

/** Restaura os campos de contexto e passa a salvá-los a cada digitação. */
export function ligarContexto(app: App): void {
  for (const campo of CAMPOS_CONTEXTO) {
    const entrada = app.ui.campos[campo];
    // Chave "cr_<id>" mantida da versão 0 para preservar o que o usuário já preencheu.
    const chave = `cr_${entrada.id}`;
    const salvo = lerTexto(chave);
    if (salvo !== null) entrada.value = salvo;
    entrada.addEventListener('input', () => gravar(chave, entrada.value));
  }
}

function linhaHTML(s: Segmento, inicio: number): string {
  const linha = formatarLinha(s, inicio, '');
  const tempo = linha.slice(1, linha.indexOf(']'));
  return `<p class="${s.manual ? 'man' : ''}"><time>${tempo}</time>${esc(s.texto)}</p>`;
}

export function renderTranscricao(app: App): void {
  const { linhas, parcial } = app.ui;
  const { segs, inicio } = app.s.dados;
  linhas.innerHTML = segs.map((s) => linhaHTML(s, inicio)).join('');
  linhas.appendChild(parcial);
  linhas.scrollTop = linhas.scrollHeight;
}

export function anexarLinha(app: App, s: Segmento): void {
  app.ui.parcial.insertAdjacentHTML('beforebegin', linhaHTML(s, app.s.dados.inicio));
  app.ui.linhas.scrollTop = app.ui.linhas.scrollHeight;
}

export function renderEstado(app: App): void {
  const { mic, estado } = app.ui;
  const ouvindo = app.s.ouvindo;
  mic.classList.toggle('on', ouvindo);
  mic.setAttribute('aria-label', ouvindo ? 'Parar de ouvir' : 'Começar a ouvir');
  estado.textContent = ouvindo ? 'Ouvindo…' : app.s.dados.segs.length > 0 ? 'Pausado' : 'Pronto para ouvir';
}

export function renderRelogio(app: App, agora: number): void {
  const { inicio, segs } = app.s.dados;
  if (inicio === 0) return;
  const fim = app.s.ouvindo ? agora : (segs.at(-1)?.t ?? inicio);
  app.ui.relogio.textContent = mmss(fim - inicio);
}

export async function copiar(app: App, texto: string, botao: HTMLButtonElement): Promise<void> {
  try {
    await navigator.clipboard.writeText(texto);
    const original = botao.textContent;
    botao.textContent = 'Copiado';
    setTimeout(() => {
      botao.textContent = original;
    }, 1500);
  } catch {
    aviso(app, 'Não foi possível copiar.', true);
  }
}
