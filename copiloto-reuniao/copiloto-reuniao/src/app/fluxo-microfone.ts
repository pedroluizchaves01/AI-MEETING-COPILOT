/**
 * DMC:    CPR-00-60-40-400A
 * Título: Núcleo › Aplicação › Microfone, anotações e nova reunião
 * BREX:   CPR-00-00-00-022A
 */
import { novoSegmento } from '../features/30-reuniao';
import { marcar } from '../features/40-sugestoes';
import { codigoErro, type Ditado } from '../features/80-integracoes';
import { mostrarAta } from './fluxo-documentos';
import { renderSugestoes } from './fluxo-sugestoes';
import { anexarLinha, aviso, renderEstado, renderTranscricao, type App } from './ui';

/** Registra uma frase final do ditado ou uma anotação digitada. */
export function registrarFala(app: App, texto: string, manual: boolean): void {
  const agora = Date.now();
  const d = app.s.dados;
  if (d.inicio === 0) d.inicio = agora;
  const seg = novoSegmento(texto, agora, manual);
  if (seg === null) return;
  d.segs.push(seg);
  app.s.ultimoSom = agora;
  anexarLinha(app, seg);
  app.s.salvar();
}

function motivoParada(reason: string): string {
  return reason === 'hidden'
    ? 'A escuta parou porque a tela ficou oculta. Toque no microfone para retomar e mantenha a tela ligada.'
    : `Escuta interrompida (${reason}). Toque no microfone para retomar.`;
}

export function ligarDitado(app: App, ditado: Ditado): void {
  ditado.onPartial(({ text }) => {
    app.s.ultimoSom = Date.now();
    app.ui.parcial.textContent = text;
  });
  ditado.onFinal(({ text }) => {
    app.ui.parcial.textContent = '';
    registrarFala(app, text, false);
  });
  ditado.onState(({ state, reason }) => {
    app.s.ouvindo = state === 'listening';
    renderEstado(app);
    if (!app.s.ouvindo && reason !== undefined && reason !== 'stopped') aviso(app, motivoParada(reason), true);
  });
}

function manterTelaLigada(): void {
  navigator.wakeLock?.request('screen').catch(() => undefined);
}

/** start() é chamado direto no clique, sem await antes (exigência da plataforma). */
function alternarMicrofone(app: App): void {
  const ditado = app.caps.ditado;
  if (ditado === null) {
    aviso(app, 'Microfone indisponível aqui. Abra no Chrome ou no app Claude desktop; a anotação manual funciona.', true);
    return;
  }
  if (app.s.ouvindo) {
    ditado.stop().catch(() => undefined);
    return;
  }
  ditado.start().catch((e: unknown) => {
    if (codigoErro(e) === 'not_granted') {
      app.ui.mic.disabled = true;
      aviso(app, 'Permissão de microfone negada. Use a anotação manual.', true);
    } else aviso(app, 'Não consegui iniciar o microfone. Tente de novo.', true);
  });
  const agora = Date.now();
  if (app.s.dados.inicio === 0) app.s.dados.inicio = agora;
  app.s.ultimaChamada = agora;
  app.s.ultimoSom = agora;
  app.ui.ctxBox.open = false;
  manterTelaLigada();
}

function ligarNovaReuniao(app: App): void {
  let confirmarAte = 0;
  const botao = app.ui.limpar;
  botao.addEventListener('click', () => {
    if (Date.now() > confirmarAte) {
      confirmarAte = Date.now() + 3000;
      botao.textContent = 'Toque de novo p/ limpar';
      setTimeout(() => (botao.textContent = 'Nova reunião'), 3000);
      return;
    }
    if (app.s.ouvindo) app.caps.ditado?.stop().catch(() => undefined);
    app.s.limpar();
    botao.textContent = 'Nova reunião';
    app.ui.ctxBox.open = true;
    renderTranscricao(app);
    renderSugestoes(app);
    renderEstado(app);
    mostrarAta(app);
    aviso(app, 'Reunião limpa. Contexto mantido.');
  });
}

export function ligarControles(app: App): void {
  const { ui } = app;
  ui.mic.addEventListener('click', () => alternarMicrofone(app));
  ui.nota.addEventListener('submit', (e) => {
    e.preventDefault();
    registrarFala(app, ui.notaIn.value, true);
    ui.notaIn.value = '';
  });
  ui.auto.addEventListener('change', () =>
    aviso(app, ui.auto.checked ? 'Sugestões automáticas ligadas.' : 'Sugestões automáticas desligadas. Use “Sugerir agora”.'),
  );
  ui.sugs.addEventListener('click', (e) => {
    const alvo = e.target instanceof Element ? e.target.closest<HTMLButtonElement>('button[data-a]') : null;
    const id = alvo?.closest<HTMLElement>('.card')?.dataset['id'];
    const acao = alvo?.dataset['a'];
    if (id === undefined || (acao !== 'feita' && acao !== 'descartada')) return;
    app.s.dados.sugestoes = marcar(app.s.dados.sugestoes, id, acao);
    app.s.salvar();
    renderSugestoes(app);
  });
  ligarNovaReuniao(app);
}
