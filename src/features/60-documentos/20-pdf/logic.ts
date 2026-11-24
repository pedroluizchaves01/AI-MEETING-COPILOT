/**
 * DMC:    CPR-60-20-00-200A
 * Título: Documentos › PDF › Diagramação A4 da ata
 * BREX:   CPR-00-00-00-022A
 *
 * Desenha a ata com jsPDF: cabeçalho com empresa e autor, metadados,
 * resumo em destaque, tabelas e listas, rodapé com paginação.
 * A fonte Poppins (400 e 600) é embutida para o texto continuar selecionável.
 */
import type { jsPDF } from 'jspdf';
import { tituloDaAta } from '../10-ata/logic';
import type { Ata, MetaAta } from '../10-ata/schemas';

type Rgb = readonly [number, number, number];
const COR = {
  tinta: [21, 23, 22],
  suave: [98, 103, 99],
  linha: [222, 224, 219],
  painel: [243, 244, 241],
  acento: [255, 90, 31],
  acentoClaro: [255, 241, 234],
} as const satisfies Record<string, Rgb>;
const PAG = { esq: 20, dir: 190, larg: 170, topo: 24, base: 272, rodape: 282 } as const;
const PT_MM = 0.3528;
const ALTURA_LINHA = 1.45;

export interface Fontes {
  readonly regular: string;
  readonly seminegrito: string;
}

/** Cursor vertical e utilidades de desenho de uma ata. */
class Diagramador {
  y: number = PAG.topo;
  constructor(readonly d: jsPDF) {}

  fonte(peso: 'normal' | 'bold', tam: number, cor: Rgb = COR.tinta): void {
    this.d.setFont('Pop', peso);
    this.d.setFontSize(tam);
    this.d.setTextColor(cor[0], cor[1], cor[2]);
  }
  linhaMm(tam: number): number {
    return tam * PT_MM * ALTURA_LINHA;
  }
  quebrar(texto: string, larg: number): string[] {
    const r: unknown = this.d.splitTextToSize(texto === '' ? '—' : texto, larg);
    return Array.isArray(r) ? r.map(String) : [String(r)];
  }
  escrever(linhas: readonly string[], x: number, y: number): void {
    this.d.text([...linhas], x, y, { lineHeightFactor: ALTURA_LINHA });
  }
  garantir(altura: number): boolean {
    if (this.y + altura <= PAG.base) return false;
    this.d.addPage();
    this.y = PAG.topo;
    return true;
  }
  preencher(cor: Rgb): void {
    this.d.setFillColor(cor[0], cor[1], cor[2]);
  }
  tracar(cor: Rgb, esp: number): void {
    this.d.setDrawColor(cor[0], cor[1], cor[2]);
    this.d.setLineWidth(esp);
  }
}

function cabecalho(g: Diagramador, a: Ata, m: MetaAta): void {
  g.fonte('bold', 9);
  g.d.text(m.empresa, PAG.esq, g.y);
  g.fonte('normal', 9, COR.suave);
  g.d.text(m.autor === '' ? 'Ata de reunião' : `Ata de reunião  ·  ${m.autor}`, PAG.dir, g.y, { align: 'right' });
  g.y += 3.5;
  g.tracar(COR.tinta, 0.45);
  g.d.line(PAG.esq, g.y, PAG.dir, g.y);
  g.y += 14;
  g.fonte('bold', 23);
  const titulo = g.quebrar(tituloDaAta(a, m), PAG.larg);
  g.d.text(titulo, PAG.esq, g.y, { lineHeightFactor: 1.12 });
  g.y += (titulo.length - 1) * 23 * PT_MM * 1.12 + 9;
  const colunas: readonly (readonly [string, string, number])[] = [
    ['Data', m.data, 38],
    ['Duração', m.duracao, 30],
    ['Participantes', m.participantes, PAG.larg - 68],
  ];
  let x: number = PAG.esq;
  let altura = 0;
  for (const [rotulo, valor, larg] of colunas) {
    g.fonte('normal', 8, COR.suave);
    g.d.text(rotulo, x, g.y);
    g.fonte('normal', 10);
    const ls = g.quebrar(valor, larg - 5);
    g.escrever(ls, x, g.y + 5.5);
    altura = Math.max(altura, 5.5 + (ls.length - 1) * g.linhaMm(10));
    x += larg;
  }
  g.y += altura + 9;
}

function resumo(g: Diagramador, texto: string): void {
  if (texto === '') return;
  g.fonte('normal', 10.5);
  const ls = g.quebrar(texto, PAG.larg - 14);
  const h = 14 + (ls.length - 1) * g.linhaMm(10.5) + 6;
  g.garantir(h);
  g.preencher(COR.acentoClaro);
  g.d.roundedRect(PAG.esq, g.y, PAG.larg, h, 2.5, 2.5, 'F');
  g.preencher(COR.acento);
  g.d.rect(PAG.esq, g.y + 2.5, 1.2, h - 5, 'F');
  g.fonte('bold', 8.5, COR.acento);
  g.d.text('Resumo', PAG.esq + 7, g.y + 7.5);
  g.fonte('normal', 10.5);
  g.escrever(ls, PAG.esq + 7, g.y + 14);
  g.y += h + 11;
}

function secao(g: Diagramador, titulo: string, n: number): void {
  g.garantir(22);
  g.preencher(COR.acento);
  g.d.rect(PAG.esq, g.y - 3.1, 2.4, 2.4, 'F');
  g.fonte('bold', 12.5);
  g.d.text(titulo, PAG.esq + 5.5, g.y);
  g.fonte('normal', 9, COR.suave);
  g.d.text(n > 1 ? `${n} itens` : '1 item', PAG.dir, g.y, { align: 'right' });
  g.y += 3.2;
  g.tracar(COR.linha, 0.25);
  g.d.line(PAG.esq, g.y, PAG.dir, g.y);
  g.y += 7;
}

type Marcador = 'numero' | 'ponto' | 'caixa';

function marcador(g: Diagramador, tipo: Marcador, i: number): void {
  switch (tipo) {
    case 'numero':
      g.fonte('bold', 9.5, COR.acento);
      g.d.text(String(i + 1).padStart(2, '0'), PAG.esq, g.y);
      return;
    case 'caixa':
      g.tracar(COR.suave, 0.3);
      g.d.roundedRect(PAG.esq + 0.2, g.y - 3.1, 3.3, 3.3, 0.5, 0.5);
      return;
    case 'ponto':
      g.preencher(COR.acento);
      g.d.circle(PAG.esq + 1.6, g.y - 1.25, 0.75, 'F');
      return;
  }
}

function lista(g: Diagramador, itens: readonly string[], tipo: Marcador): void {
  itens.forEach((t, i) => {
    g.fonte('normal', 10);
    const ls = g.quebrar(t, PAG.larg - 9);
    const h = (ls.length - 1) * g.linhaMm(10);
    g.garantir(h + 5);
    marcador(g, tipo, i);
    g.fonte('normal', 10);
    g.escrever(ls, PAG.esq + 9, g.y);
    g.y += h + g.linhaMm(10) + 1.6;
  });
  g.y += 6;
}

function cabecalhoTabela(g: Diagramador, cab: readonly string[], larg: readonly number[]): void {
  g.preencher(COR.painel);
  g.d.rect(PAG.esq, g.y, PAG.larg, 8, 'F');
  g.fonte('bold', 8.5, COR.suave);
  let x: number = PAG.esq;
  cab.forEach((c, i) => {
    g.d.text(c, x + 3, g.y + 5.4);
    x += larg[i] ?? 0;
  });
  g.y += 8;
}

interface Tabela {
  readonly cab: readonly string[];
  readonly larg: readonly number[];
  readonly linhas: readonly (readonly string[])[];
  /** Primeira coluna em seminegrito (tabela tema/detalhe). */
  readonly destaque: boolean;
}

function tabela(g: Diagramador, t: Tabela): void {
  const { cab, larg, linhas, destaque } = t;
  g.garantir(20);
  cabecalhoTabela(g, cab, larg);
  for (const linha of linhas) {
    g.fonte('normal', 9.5);
    const celulas = linha.map((v, i) => g.quebrar(v, (larg[i] ?? 20) - 6));
    const n = Math.max(...celulas.map((c) => c.length));
    const h = 6 + (n - 1) * g.linhaMm(9.5) + 3.4;
    if (g.garantir(h)) cabecalhoTabela(g, cab, larg);
    let x: number = PAG.esq;
    celulas.forEach((c, i) => {
      const primeira = i === 0;
      g.fonte(primeira && destaque ? 'bold' : 'normal', 9.5, primeira ? COR.tinta : COR.suave);
      g.escrever(c, x + 3, g.y + 6);
      x += larg[i] ?? 0;
    });
    g.y += h;
    g.tracar(COR.linha, 0.2);
    g.d.line(PAG.esq, g.y, PAG.dir, g.y);
  }
  g.y += 10;
}

function rodapes(g: Diagramador, m: MetaAta): void {
  const total = g.d.getNumberOfPages();
  const esquerda = `${m.empresa === '' ? '' : `${m.empresa}  ·  `}Ata de ${m.data}`;
  for (let p = 1; p <= total; p++) {
    g.d.setPage(p);
    g.tracar(COR.linha, 0.25);
    g.d.line(PAG.esq, PAG.rodape, PAG.dir, PAG.rodape);
    g.fonte('normal', 8, COR.suave);
    g.d.text(esquerda, PAG.esq, PAG.rodape + 5);
    g.d.text(`Página ${p} de ${total}`, PAG.dir, PAG.rodape + 5, { align: 'right' });
  }
}

export function gerarPDF(Construtor: typeof jsPDF, a: Ata, m: MetaAta, f: Fontes): jsPDF {
  if (f.regular === '' || f.seminegrito === '') throw new Error('Fontes do PDF ausentes.');
  const d = new Construtor({ unit: 'mm', format: 'a4' });
  d.addFileToVFS('pop4.ttf', f.regular);
  d.addFont('pop4.ttf', 'Pop', 'normal');
  d.addFileToVFS('pop6.ttf', f.seminegrito);
  d.addFont('pop6.ttf', 'Pop', 'bold');
  const g = new Diagramador(d);
  cabecalho(g, a, m);
  resumo(g, a.resumo);
  if (a.informacoes.length > 0) {
    secao(g, 'Informações levantadas', a.informacoes.length);
    const linhas = a.informacoes.map((i) => [i.tema, i.detalhe]);
    tabela(g, { cab: ['Tema', 'Detalhe'], larg: [46, PAG.larg - 46], linhas, destaque: true });
  }
  if (a.decisoes.length > 0) {
    secao(g, 'Decisões', a.decisoes.length);
    lista(g, a.decisoes, 'numero');
  }
  if (a.pendencias.length > 0) {
    secao(g, 'Pendências', a.pendencias.length);
    const linhas = a.pendencias.map((p) => [p.item, p.responsavel, p.prazo]);
    tabela(g, { cab: ['Item', 'Responsável', 'Prazo'], larg: [PAG.larg - 72, 42, 30], linhas, destaque: false });
  }
  if (a.perguntasAbertas.length > 0) {
    secao(g, 'Perguntas em aberto', a.perguntasAbertas.length);
    lista(g, a.perguntasAbertas, 'ponto');
  }
  if (a.proximosPassos.length > 0) {
    secao(g, 'Próximos passos', a.proximosPassos.length);
    lista(g, a.proximosPassos, 'caixa');
  }
  rodapes(g, m);
  return d;
}
