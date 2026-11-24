/**
 * DMC:    CPR-00-40-00-300A
 * Título: Núcleo › Armazenamento › localStorage tolerante a falhas
 * BREX:   CPR-00-00-00-022A
 *
 * O localStorage pode não existir ou lançar erro (modo privado, iframe isolado).
 * Toda leitura devolve null nesses casos; toda escrita falha em silêncio.
 */

export function ler(chave: string): unknown {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto === null ? null : JSON.parse(bruto);
  } catch {
    return null;
  }
}

export function gravar(chave: string, valor: unknown): void {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    /* armazenamento indisponível: a sessão continua só em memória */
  }
}

export function lerTexto(chave: string): string | null {
  const v = ler(chave);
  return typeof v === 'string' ? v : null;
}
