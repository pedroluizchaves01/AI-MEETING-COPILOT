// DMC: CPR-90-20-00-900A | Título: Infraestrutura › Estudo de eficiência › Executor
//
// npm run bench → mede o pacote, a geração de PDF, o custo do ciclo de 500 ms
// e simula reuniões de 60 min para contar chamadas ao Claude e o tamanho dos prompts.
// Resultado em docs/eficiencia-dados.json (base do docs/eficiencia.md).
import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const raiz = new URL('..', import.meta.url);
const p = (x) => new URL(x, raiz).pathname;

async function composicaoDoPacote() {
  const r = await build({
    entryPoints: [p('src/app/main.ts')], bundle: true, format: 'iife', minify: true, write: false, metafile: true,
    loader: { '.ttf': 'base64' }, external: ['html2canvas', 'dompurify', 'canvg'], logLevel: 'silent',
  });
  const saida = Object.values(r.metafile.outputs)[0];
  const grupos = {};
  for (const [arq, info] of Object.entries(saida.inputs)) {
    const g = arq.includes('node_modules/jspdf') ? 'jsPDF' : arq.includes('node_modules/') ? 'outras dependências do jsPDF'
      : arq.endsWith('.ttf') ? 'fontes Poppins (base64)' : 'código do app';
    grupos[g] = (grupos[g] ?? 0) + info.bytesInOutput;
  }
  const html = await readFile(p('dist/index.html'));
  return { htmlKB: html.length / 1024, htmlGzipKB: gzipSync(html).length / 1024, partesKB: Object.fromEntries(Object.entries(grupos).map(([k, v]) => [k, v / 1024])) };
}

async function main() {
  await mkdir(p('node_modules/.cache'), { recursive: true });
  const destino = p('node_modules/.cache/bench.mjs');
  await build({ entryPoints: [p('scripts/bench-entrada.ts')], bundle: true, platform: 'node', format: 'esm', outfile: destino, external: ['jspdf'], logLevel: 'warning' });
  const { executar } = await import(destino);
  const dados = { geradoEm: new Date().toISOString(), node: process.version, pacote: await composicaoDoPacote(), ...executar() };
  await writeFile(p('docs/eficiencia-dados.json'), JSON.stringify(dados, null, 2) + '\n');
  const f = (n) => (Math.round(n * 10) / 10).toLocaleString('pt-BR');
  console.log(`Pacote: ${f(dados.pacote.htmlKB)} KB (gzip ${f(dados.pacote.htmlGzipKB)} KB)`, dados.pacote.partesKB);
  console.log(`PDF curto: ${f(dados.pdf.curta.ms)} ms, ${f(dados.pdf.curta.kb)} KB, ${dados.pdf.curta.paginas} pág.`);
  console.log(`PDF longo: ${f(dados.pdf.longa.ms)} ms, ${f(dados.pdf.longa.kb)} KB, ${dados.pdf.longa.paginas} pág.`);
  console.log(`Ciclo de 500 ms: ${f(dados.tickMicrossegundos.segs100)} µs (100 falas) · ${f(dados.tickMicrossegundos.segs2000)} µs (2000 falas)`);
  for (const l of dados.tabela) console.log(`${l.perfil} | ${l.variante} | ${f(l.chamadasPorHora)} chamadas/h (${f(l.porPausa)} pausa, ${f(l.porCiclo)} ciclo) | intervalo ${f(l.intervaloMedioS)} s | maior espera ${f(l.maiorEsperaS)} s | prompt médio ${f(l.charsPromptMedio)} / máx ${f(l.charsPromptMax)} caracteres | resumos ${f(l.resumosPorHora)}`);
  console.log('Transcrição inteira (abordagem ingênua):', dados.crescimento.map((c) => `${c.minuto} min → ${c.charsTranscricaoInteira} caracteres`).join(' · '));
}

await main();
