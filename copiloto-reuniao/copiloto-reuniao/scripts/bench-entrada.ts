/**
 * DMC:    CPR-90-20-10-700A
 * Título: Infraestrutura › Estudo de eficiência › Simulações e medições
 * BREX:   CPR-00-00-00-022A
 *
 * Usa o mesmo código do app (gatilho, janela, resumo, prompts, PDF) sobre
 * reuniões sintéticas reproduzíveis (semente fixa). Nada aqui chama o Claude:
 * a latência do Claude é um parâmetro da simulação, não uma medição.
 */
import { readFileSync } from 'node:fs';
import { jsPDF } from 'jspdf';
import {
  contarNovos, decidirGatilho, gerarPDF, inicioDaCaudaPublico, janelaRecente, montarPromptSugestoes, normalizarAta,
  textoDe, trechoParaResumir, type MetaAta, type RegrasGatilho, type Segmento,
} from './bench-api';

/** PRNG determinístico (mulberry32). */
function prng(semente: number): () => number {
  let a = semente >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Perfil {
  readonly nome: string;
  /** Probabilidade de uma pausa longa (3–8 s) depois de uma frase. */
  readonly pPausa: number;
}

interface Evento {
  readonly inicio: number;
  readonly fim: number;
  readonly texto: string;
}

/** Gera ~60 min de falas: frases de 40–180 caracteres a ~14 caracteres/s. */
function gerarReuniao(perfil: Perfil, minutos: number, semente: number): Evento[] {
  const r = prng(semente);
  const eventos: Evento[] = [];
  let t = 0;
  const fim = minutos * 60000;
  for (let i = 0; i < 100000 && t < fim; i++) {
    const chars = 40 + Math.floor(r() * 140);
    const dur = (chars / 14) * 1000;
    eventos.push({ inicio: t, fim: t + dur, texto: 'x'.repeat(chars) });
    const pausa = r() < perfil.pPausa ? 3000 + r() * 5000 : 300 + r() * 1700;
    t += dur + pausa;
  }
  return eventos;
}

interface Resultado {
  readonly chamadas: number;
  readonly porPausa: number;
  readonly porCiclo: number;
  readonly intervaloMedioS: number;
  readonly maiorEsperaS: number;
  readonly charsPromptMedio: number;
  readonly charsPromptMax: number;
  readonly resumos: number;
}

const T0 = 1_700_000_000_000;
const CTX = { empresa: 'Empresa', autor: 'Autor', objetivo: 'Reunião de levantamento', participantes: 'Cliente', pauta: 'prazo, orçamento, escopo' };

/** Reproduz o laço do app (tick de 500 ms) com uma latência fixa por chamada ao Claude. */
function simular(eventos: readonly Evento[], regras: RegrasGatilho, latenciaMs: number, cooldownMs = 0): Resultado {
  const segs: Segmento[] = [];
  let analisadoAte = 0, resumidoAte = 0, ultimaChamada = 0, ocupadoAte = 0, ultimoSom = 0, prox = 0, resumos = 0;
  const instantes: number[] = [];
  const tamanhos: number[] = [];
  let porPausa = 0, porCiclo = 0;
  const fim = (eventos.at(-1)?.fim ?? 0) + 10000;
  for (let agora = 0; agora <= fim; agora += 500) {
    while (prox < eventos.length && (eventos[prox]?.fim ?? Infinity) <= agora) {
      const e = eventos[prox++];
      if (e !== undefined) segs.push({ t: T0 + e.fim, texto: e.texto, manual: false });
      ultimoSom = agora;
    }
    const falando = prox < eventos.length && (eventos[prox]?.inicio ?? Infinity) <= agora;
    if (falando) ultimoSom = agora;
    const motivo = decidirGatilho({
      agora, ultimoSom, ultimaChamada, novosChars: contarNovos(segs, analisadoAte, falando ? 'parcial' : ''),
      temParcial: falando, pausaAte: 0, pronto: agora >= ocupadoAte && agora - ultimaChamada >= cooldownMs,
    }, regras);
    if (motivo === null) continue;
    if (motivo === 'pausa') porPausa++; else porCiclo++;
    instantes.push(agora);
    ultimaChamada = agora;
    ocupadoAte = agora + latenciaMs;
    analisadoAte = segs.length;
    const recente = janelaRecente(segs, T0, resumidoAte, '');
    tamanhos.push(montarPromptSugestoes({ ctx: CTX, resumo: resumos > 0 ? 'r'.repeat(1700) : '', recente, anteriores: Array(25).fill('Pergunta sugerida anteriormente com tamanho médio?'), feitas: [] }).length);
    const trecho = trechoParaResumir(segs, T0, resumidoAte);
    if (trecho !== null) { resumidoAte = trecho.ate; resumos++; ocupadoAte += latenciaMs; }
  }
  const intervalos = instantes.slice(1).map((t, i) => t - (instantes[i] ?? 0));
  const media = (xs: readonly number[]): number => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
  return {
    chamadas: instantes.length, porPausa, porCiclo,
    intervaloMedioS: media(intervalos) / 1000,
    maiorEsperaS: Math.max(0, ...intervalos) / 1000,
    charsPromptMedio: media(tamanhos), charsPromptMax: Math.max(0, ...tamanhos), resumos,
  };
}

/** Quanto o prompt cresceria se a transcrição inteira fosse enviada a cada chamada. */
function promptIngenuo(eventos: readonly Evento[], minuto: number): number {
  const segs = eventos.filter((e) => e.fim <= minuto * 60000).map((e) => ({ t: T0 + e.fim, texto: e.texto, manual: false }));
  return textoDe(segs, T0).length;
}

function medirPDF(n: number, itens: number): { readonly ms: number; readonly kb: number; readonly paginas: number } {
  const fonte = (f: string): string => readFileSync(`${process.cwd()}/assets/fonts/${f}`).toString('base64');
  const fontes = { regular: fonte('Poppins-Regular.ttf'), seminegrito: fonte('Poppins-SemiBold.ttf') };
  const m: MetaAta = { empresa: 'Empresa', autor: 'Autor', objetivo: 'Teste', participantes: 'A; B', data: '24/11/2026', duracao: '60 min' };
  const item = 'Item de pendência com descrição de tamanho médio para medir a diagramação';
  const ata = normalizarAta({
    resumo: 'Resumo da reunião com quatro frases. '.repeat(4),
    informacoes: Array.from({ length: itens }, (_, i) => ({ tema: `Tema ${i}`, detalhe: item })),
    decisoes: Array.from({ length: itens }, () => item),
    pendencias: Array.from({ length: itens }, () => ({ item, responsavel: 'Cliente', prazo: '05/12' })),
    perguntas_abertas: Array.from({ length: itens }, () => `${item}?`),
    proximos_passos: Array.from({ length: itens }, () => item),
  });
  if (ata === null) throw new Error('ata de teste inválida');
  const tempos: number[] = [];
  let kb = 0, paginas = 0;
  for (let i = 0; i < n; i++) {
    const t = performance.now();
    const doc = gerarPDF(jsPDF, ata, m, fontes);
    const buf = doc.output('arraybuffer');
    tempos.push(performance.now() - t);
    kb = buf.byteLength / 1024;
    paginas = doc.getNumberOfPages();
  }
  tempos.sort((a, b) => a - b);
  return { ms: tempos[Math.floor(n / 2)] ?? 0, kb, paginas };
}

function medirTick(nSegs: number): number {
  const segs = Array.from({ length: nSegs }, (_, i) => ({ t: T0 + i * 5000, texto: 'x'.repeat(100), manual: false }));
  const n = 2000;
  const t = performance.now();
  for (let i = 0; i < n; i++) {
    decidirGatilho({ agora: i, ultimoSom: 0, ultimaChamada: 0, novosChars: contarNovos(segs, nSegs - 5, ''), temParcial: false, pausaAte: 0, pronto: true });
    inicioDaCaudaPublico(segs, 0, 2800);
  }
  return ((performance.now() - t) / n) * 1000;
}

export function executar(): unknown {
  const perfis: Perfil[] = [
    { nome: 'conversa fluida (5% de pausas longas)', pPausa: 0.05 },
    { nome: 'conversa típica (15%)', pPausa: 0.15 },
    { nome: 'conversa pausada (35%)', pPausa: 0.35 },
  ];
  const variantes: readonly { readonly nome: string; readonly regras: RegrasGatilho; readonly cooldown: number }[] = [
    { nome: 'atual: pausa 3 s · ciclo 60 s · mín. 30 caracteres', regras: { pausaMs: 3000, cicloMs: 60000, minChars: 30 }, cooldown: 0 },
    { nome: 'mín. 150 caracteres', regras: { pausaMs: 3000, cicloMs: 60000, minChars: 150 }, cooldown: 0 },
    { nome: 'intervalo mínimo de 15 s entre chamadas', regras: { pausaMs: 3000, cicloMs: 60000, minChars: 30 }, cooldown: 15000 },
    { nome: 'pausa 5 s', regras: { pausaMs: 5000, cicloMs: 60000, minChars: 30 }, cooldown: 0 },
  ];
  const sementes = [11, 22, 33, 44, 55];
  const tabela = perfis.flatMap((p) =>
    variantes.map((v) => {
      const rs = sementes.map((s) => simular(gerarReuniao(p, 60, s), v.regras, 2000, v.cooldown));
      const med = (k: keyof Resultado): number => rs.reduce((a, r) => a + r[k], 0) / rs.length;
      return {
        perfil: p.nome, variante: v.nome,
        chamadasPorHora: med('chamadas'), porPausa: med('porPausa'), porCiclo: med('porCiclo'),
        intervaloMedioS: med('intervaloMedioS'), maiorEsperaS: med('maiorEsperaS'),
        charsPromptMedio: med('charsPromptMedio'), charsPromptMax: med('charsPromptMax'), resumosPorHora: med('resumos'),
      };
    }),
  );
  const tipica = gerarReuniao(perfis[1] ?? { nome: '', pPausa: 0.15 }, 60, 11);
  const crescimento = [5, 15, 30, 60].map((min) => ({ minuto: min, charsTranscricaoInteira: promptIngenuo(tipica, min) }));
  return {
    sementes, latenciaSimuladaMs: 2000, tabela, crescimento,
    pdf: { curta: medirPDF(15, 2), longa: medirPDF(15, 25) },
    tickMicrossegundos: { segs100: medirTick(100), segs2000: medirTick(2000) },
  };
}
