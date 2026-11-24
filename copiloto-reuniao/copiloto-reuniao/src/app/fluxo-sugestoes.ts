/**
 * DMC:    CPR-00-60-20-400A
 * Título: Núcleo › Aplicação › Fluxo de sugestões e resumo contínuo
 * BREX:   CPR-00-00-00-022A
 */
import {
  contarNovos, decidirGatilho, janelaRecente, trechoParaResumir,
} from '../features/30-reuniao';
import {
  empilhar, montarPromptResumo, montarPromptSugestoes, normalizarSugestoes, renderCartoes, renderFeitas,
} from '../features/40-sugestoes';
import { codigoErro, pedirJSON } from '../features/80-integracoes';
import { aviso, contexto, type App } from './ui';

const PAUSA_LIMITE_MS = 60000;

export function renderSugestoes(app: App): void {
  const { sugestoes, loteAtual, inicio } = app.s.dados;
  renderCartoes(app.ui.sugs, sugestoes, loteAtual, inicio);
  renderFeitas(app.ui.feitas, sugestoes);
}

export function tratarErroClaude(app: App, e: unknown, acao: string): void {
  const codigo = codigoErro(e);
  if (codigo === 'not_granted') {
    app.caps = { ...app.caps, sample: null };
    app.ui.agora.disabled = true;
    app.ui.gerarAta.disabled = true;
    aviso(app, 'Acesso ao Claude não autorizado nesta página. A transcrição continua funcionando.', true);
  } else if (codigo === 'rate_limited') {
    app.s.pausaAte = Date.now() + PAUSA_LIMITE_MS;
    aviso(app, 'Limite de uso atingido. As sugestões ficam pausadas por 1 minuto.', true);
  } else if (codigo !== 'abortado') {
    aviso(app, `Falha ao ${acao}. Nova tentativa no próximo ciclo.`, true);
  }
}

const parcial = (app: App): string => app.ui.parcial.textContent ?? '';

/** Confere se dá para pedir sugestões agora e devolve o trecho recente, ou null. */
function prepararPedido(app: App, manual: boolean): string | null {
  if (app.caps.sample === null) {
    if (manual) aviso(app, 'Claude indisponível nesta visualização. Abra a página no Chrome ou no app desktop.', true);
    return null;
  }
  if (app.s.ocupado || Date.now() < app.s.pausaAte) return null;
  const d = app.s.dados;
  const recente = janelaRecente(d.segs, d.inicio, d.resumidoAte, parcial(app));
  if (recente.trim() === '') {
    if (manual) aviso(app, 'Ainda não há fala transcrita.');
    return null;
  }
  return recente;
}

function aplicarResposta(app: App, bruto: unknown, analisadoAte: number, manual: boolean): void {
  const d = app.s.dados;
  const lote = Date.now();
  const novas = normalizarSugestoes(bruto, lote, d.sugestoes.map((s) => s.pergunta));
  d.analisadoAte = analisadoAte;
  if (novas.length > 0) {
    d.sugestoes = empilhar(d.sugestoes, novas);
    d.loteAtual = lote;
  }
  app.s.salvar();
  renderSugestoes(app);
  if (manual || novas.length > 0) {
    aviso(app, novas.length > 0 ? `${novas.length} nova(s) sugestão(ões).` : 'Nada novo a sugerir por enquanto.');
  }
}

export async function sugerir(app: App, manual: boolean): Promise<void> {
  const recente = prepararPedido(app, manual);
  const sample = app.caps.sample;
  if (recente === null || sample === null) return;
  const d = app.s.dados;
  app.s.ocupado = true;
  app.s.ultimaChamada = Date.now();
  app.ui.pensando.hidden = false;
  const ate = d.segs.length;
  const prompt = montarPromptSugestoes({
    ctx: contexto(app), resumo: d.resumo, recente,
    anteriores: d.sugestoes.map((s) => s.pergunta),
    feitas: d.sugestoes.filter((s) => s.destino === 'feita').map((s) => s.pergunta),
  });
  try {
    app.s.controle = new AbortController();
    const bruto = await pedirJSON(sample, prompt, { modelTier: 'quick', signal: app.s.controle.signal, cache: false });
    aplicarResposta(app, bruto, ate, manual);
  } catch (e) {
    tratarErroClaude(app, e, 'gerar sugestões');
  } finally {
    app.s.ocupado = false;
    app.ui.pensando.hidden = true;
  }
  await resumir(app);
}

/** Converte a parte antiga da transcrição em resumo quando ela passa do limite. */
export async function resumir(app: App): Promise<void> {
  const sample = app.caps.sample;
  const d = app.s.dados;
  if (sample === null || app.s.ocupado) return;
  const trecho = trechoParaResumir(d.segs, d.inicio, d.resumidoAte);
  if (trecho === null) return;
  app.s.ocupado = true;
  try {
    const r = await sample(montarPromptResumo(d.resumo, trecho.texto), { modelTier: 'quick', cache: false });
    d.resumo = r.text.trim();
    d.resumidoAte = trecho.ate;
    app.s.salvar();
  } catch (e) {
    tratarErroClaude(app, e, 'resumir a conversa');
  } finally {
    app.s.ocupado = false;
  }
}

/** Chamado a cada 500 ms: decide se é hora de pedir sugestões. */
export function verificarGatilho(app: App, agora: number): void {
  const d = app.s.dados;
  const p = parcial(app).trim();
  const motivo = decidirGatilho({
    agora,
    ultimoSom: app.s.ultimoSom,
    ultimaChamada: app.s.ultimaChamada,
    novosChars: contarNovos(d.segs, d.analisadoAte, p),
    temParcial: p !== '',
    pausaAte: app.s.pausaAte,
    pronto: app.s.ouvindo && app.ui.auto.checked && app.caps.sample !== null && !app.s.ocupado,
  });
  if (motivo !== null) void sugerir(app, false);
}
