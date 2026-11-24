// DMC: CPR-00-00-20-022A | Título: BREX — valida cabeçalhos DMC contra a DMRL e o SNS
//
// Regras:
//  1. Todo arquivo de src/ (.ts, .css, .html) tem um cabeçalho "DMC: CPR-SS-SE-AS-ICV".
//  2. Nenhum DMC se repete.
//  3. Todo DMC está listado em docs/DMRL.md.
//  4. Todo sistema/seção (SS-SE) está descrito em docs/SNS.md.
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const RAIZ = new URL('..', import.meta.url).pathname;
const PADRAO = /DMC:\s+(CPR-(\d{2})-(\d{2})-\d{2}-\d{3}[A-Z])/;
const PASTAS = ['src', 'scripts', 'brex'];
const EXT = /\.(ts|css|html|mjs|cjs|js)$/;
const MAX_ARQUIVOS = 1000;

async function listar(dir, saida) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (saida.length >= MAX_ARQUIVOS) throw new Error('Arquivos demais para verificar.');
    const p = join(dir, e.name);
    if (e.isDirectory()) await listar(p, saida);
    else if (EXT.test(e.name)) saida.push(p);
  }
  return saida;
}

const arquivos = [join(RAIZ, 'eslint.config.js')];
for (const pasta of PASTAS) await listar(join(RAIZ, pasta), arquivos);

const [dmrl, sns] = await Promise.all(['docs/DMRL.md', 'docs/SNS.md'].map((p) => readFile(join(RAIZ, p), 'utf8')));
const erros = [];
const vistos = new Map();

for (const arq of arquivos) {
  const rel = relative(RAIZ, arq);
  const m = PADRAO.exec(await readFile(arq, 'utf8'));
  if (m === null) {
    erros.push(`${rel}: sem cabeçalho DMC`);
    continue;
  }
  const [, dmc, ss, se] = m;
  if (vistos.has(dmc)) erros.push(`${rel}: DMC ${dmc} repetido (já usado em ${vistos.get(dmc)})`);
  vistos.set(dmc, rel);
  if (!dmrl.includes(dmc)) erros.push(`${rel}: ${dmc} não está na docs/DMRL.md`);
  if (!sns.includes(`${ss}-${se}`)) erros.push(`${rel}: seção ${ss}-${se} não está no docs/SNS.md`);
}

if (erros.length > 0) {
  console.error(erros.join('\n'));
  process.exit(1);
}
console.log(`check-dmc: ${vistos.size} módulos conferidos, nenhum problema.`);
