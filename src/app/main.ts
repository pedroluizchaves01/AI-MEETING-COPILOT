/**
 * DMC:    CPR-00-60-50-400A
 * Título: Núcleo › Aplicação › Ponto de entrada
 * BREX:   CPR-00-00-00-022A
 */
import { carregarCapacidades } from '../features/80-integracoes';
import { ligarDocumentos, mostrarAta } from './fluxo-documentos';
import { ligarControles, ligarDitado } from './fluxo-microfone';
import { renderSugestoes, sugerir, verificarGatilho } from './fluxo-sugestoes';
import { Sessao } from './sessao';
import { aviso, ligarContexto, obterElementos, renderEstado, renderRelogio, renderTranscricao, type App } from './ui';

const CICLO_MS = 500;

async function ativarCapacidades(app: App): Promise<void> {
  app.caps = await carregarCapacidades();
  const { ditado, sample, downloads } = app.caps;
  if (ditado === null) {
    app.ui.mic.disabled = true;
    aviso(app, 'Ditado indisponível nesta visualização: abra no Chrome (computador ou Android) ou no app Claude desktop. A anotação manual funciona.', true);
  } else ligarDitado(app, ditado);
  app.ui.agora.disabled = sample === null;
  app.ui.gerarAta.disabled = sample === null;
  app.ui.pdfAta.hidden = downloads === null;
  app.ui.txtTx.hidden = downloads === null;
}

function iniciar(): void {
  const app: App = {
    s: new Sessao(),
    ui: obterElementos(),
    caps: { ditado: null, sample: null, downloads: null },
  };
  ligarContexto(app);
  ligarControles(app);
  ligarDocumentos(app);
  app.ui.agora.addEventListener('click', () => void sugerir(app, true));
  renderTranscricao(app);
  renderSugestoes(app);
  renderEstado(app);
  renderRelogio(app, Date.now());
  mostrarAta(app);
  setInterval(() => {
    const agora = Date.now();
    if (app.s.ouvindo) renderRelogio(app, agora);
    verificarGatilho(app, agora);
  }, CICLO_MS);
  void ativarCapacidades(app);
}

iniciar();
