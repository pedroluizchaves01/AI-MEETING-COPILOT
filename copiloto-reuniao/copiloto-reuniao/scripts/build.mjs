// DMC: CPR-90-10-00-900A | Título: Infraestrutura › Build › Compila o app num único index.html
//
// O artifact do Claude é um único documento HTML. O build junta tudo:
//   TypeScript (src/app/main.ts) → esbuild → JS minificado (com jsPDF e fontes em base64)
//   CSS (tokens + app)           → esbuild → CSS minificado
//   src/index.html               → recebe CSS e JS embutidos → dist/index.html
import { build, transform } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const raiz = new URL('..', import.meta.url);
const caminho = (p) => new URL(p, raiz);
const kb = (n) => `${(n / 1024).toFixed(1)} KB`;

async function compilarJS() {
  const r = await build({
    entryPoints: [caminho('src/app/main.ts').pathname],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    target: ['es2020', 'chrome100', 'safari15'],
    minify: true,
    legalComments: 'none',
    write: false,
    loader: { '.ttf': 'base64' },
    // Recursos do jsPDF que o app não usa (HTML→PDF, SVG): ficam fora do pacote.
    external: ['html2canvas', 'dompurify', 'canvg'],
    logLevel: 'warning',
  });
  const arquivo = r.outputFiles[0];
  if (arquivo === undefined) throw new Error('esbuild não gerou saída.');
  return arquivo.text.replaceAll('</script', '<\\/script');
}

async function compilarCSS() {
  const fontes = await Promise.all(['src/styles/tokens.css', 'src/styles/app.css'].map((p) => readFile(caminho(p), 'utf8')));
  const r = await transform(fontes.join('\n'), { loader: 'css', minify: true, target: ['chrome100', 'safari15'] });
  return r.code;
}

async function main() {
  const inicio = performance.now();
  const [js, css, modelo] = await Promise.all([compilarJS(), compilarCSS(), readFile(caminho('src/index.html'), 'utf8')]);
  if (!modelo.includes('/*__CSS__*/') || !modelo.includes('/*__JS__*/')) throw new Error('Marcadores ausentes em src/index.html.');
  const html = modelo.replace('/*__CSS__*/', () => css).replace('/*__JS__*/', () => js);
  await mkdir(caminho('dist'), { recursive: true });
  await writeFile(caminho('dist/index.html'), html);
  const ms = Math.round(performance.now() - inicio);
  console.log(`dist/index.html  ${kb(html.length)}  (gzip ${kb(gzipSync(html).length)})  JS ${kb(js.length)}  CSS ${kb(css.length)}  em ${ms} ms`);
}

await main();
