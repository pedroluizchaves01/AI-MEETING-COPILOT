/**
 * DMC:    CPR-00-60-30-400A
 * Título: Núcleo › Aplicação › Fluxo da ata, PDF e transcrição em .txt
 * BREX:   CPR-00-00-00-022A
 */
import { jsPDF } from 'jspdf';
import fonteRegular from '../../assets/fonts/Poppins-Regular.ttf';
import fonteSemi from '../../assets/fonts/Poppins-SemiBold.ttf';
import { corpoParaAta, textoDe } from '../features/30-reuniao';
import {
  ataHTML, ataTexto, gerarPDF, montarMeta, montarPromptAta, nomeArquivo, normalizarAta, transcricaoTexto,
  tituloDaAta, type MetaAta,
} from '../features/60-documentos';
import { codigoErro, pedirJSON } from '../features/80-integracoes';
import { tratarErroClaude } from './fluxo-sugestoes';
import { aviso, contexto, copiar, type App } from './ui';

function meta(app: App): MetaAta {
  const { inicio, segs } = app.s.dados;
  const ini = inicio > 0 ? inicio : Date.now();
  return montarMeta(contexto(app), ini, segs.at(-1)?.t ?? ini);
}

export function mostrarAta(app: App): void {
  const ata = app.s.ata;
  app.ui.ata.hidden = ata === null;
  if (ata !== null) app.ui.ataTxt.innerHTML = ataHTML(ata, meta(app));
}

export async function gerarAta(app: App): Promise<void> {
  const sample = app.caps.sample;
  const d = app.s.dados;
  if (sample === null) return aviso(app, 'Claude indisponível nesta visualização.', true);
  if (d.segs.length === 0) return aviso(app, 'Ainda não há conversa para gerar a ata.');
  app.s.controle?.abort();
  const { ata, ataTxt, gerarAta: botao } = app.ui;
  ata.hidden = false;
  botao.disabled = true;
  ataTxt.innerHTML = '<p class="gerando">Claude está redigindo a ata… isso leva alguns segundos.</p>';
  ata.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const m = meta(app);
  const prompt = montarPromptAta(contexto(app), m, corpoParaAta(d.segs, d.inicio, d.resumo, d.resumidoAte));
  try {
    const bruto = await pedirJSON(sample, prompt, { modelTier: 'default', cache: false });
    if (normalizarAta(bruto) === null) throw new Error('Resposta do Claude sem conteúdo de ata.');
    d.ataBruta = bruto;
    app.s.salvar();
    mostrarAta(app);
    aviso(app, 'Ata pronta. Toque em “Baixar PDF” para exportar.');
  } catch (e) {
    ataTxt.innerHTML = '<p class="gerando">Não foi possível gerar a ata agora. Tente novamente.</p>';
    tratarErroClaude(app, e, 'gerar a ata');
  } finally {
    botao.disabled = false;
  }
}

async function salvarArquivo(app: App, nome: string, dados: string | Blob, ok: string): Promise<void> {
  const dl = app.caps.downloads;
  if (dl === null) return aviso(app, 'Download indisponível nesta visualização. Abra a página no navegador.', true);
  try {
    await dl.save({ filename: nome, data: dados });
    aviso(app, ok);
  } catch (e) {
    const c = codigoErro(e);
    if (c === 'declined') aviso(app, 'Download cancelado.');
    else if (c === 'host_unavailable') aviso(app, 'Este app não salva arquivos. Abra a página no navegador ou no computador.', true);
    else if (c === 'rate_limited') aviso(app, 'Já há um download aguardando confirmação.', true);
    else aviso(app, 'Não foi possível salvar o arquivo.', true);
  }
}

export async function baixarPDF(app: App): Promise<void> {
  const ata = app.s.ata;
  if (ata === null) return;
  const m = meta(app);
  app.ui.pdfAta.disabled = true;
  try {
    const doc = gerarPDF(jsPDF, ata, m, { regular: fonteRegular, seminegrito: fonteSemi });
    await salvarArquivo(app, nomeArquivo('Ata', tituloDaAta(ata, m), m, 'pdf'), doc.output('blob'), 'PDF salvo.');
  } finally {
    app.ui.pdfAta.disabled = false;
  }
}

export async function baixarTXT(app: App): Promise<void> {
  const d = app.s.dados;
  if (d.segs.length === 0) return aviso(app, 'Ainda não há transcrição para exportar.');
  const m = meta(app);
  app.ui.txtTx.disabled = true;
  try {
    const nome = nomeArquivo('Transcrição', m.objetivo, m, 'txt');
    await salvarArquivo(app, nome, transcricaoTexto(d.segs, d.inicio, m), 'Transcrição salva em .txt.');
  } finally {
    app.ui.txtTx.disabled = false;
  }
}

export function ligarDocumentos(app: App): void {
  const { ui } = app;
  ui.gerarAta.addEventListener('click', () => void gerarAta(app));
  ui.pdfAta.addEventListener('click', () => void baixarPDF(app));
  ui.txtTx.addEventListener('click', () => void baixarTXT(app));
  ui.copTx.addEventListener('click', () => void copiar(app, textoDe(app.s.dados.segs, app.s.dados.inicio), ui.copTx));
  ui.copAta.addEventListener('click', () => {
    const ata = app.s.ata;
    if (ata !== null) void copiar(app, ataTexto(ata, meta(app)), ui.copAta);
  });
}
