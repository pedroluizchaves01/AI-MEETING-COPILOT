/**
 * DMC:    CPR-00-20-00-400A
 * Título: Núcleo › DOM › Acesso tipado e escape de HTML
 * BREX:   CPR-00-00-00-022A
 */

/** Busca um elemento pelo id e garante o tipo esperado. Falha cedo se o HTML mudar. */
export function el<T extends HTMLElement>(id: string, tipo: new () => T): T {
  const alvo = document.getElementById(id);
  if (!(alvo instanceof tipo)) {
    throw new Error(`Elemento #${id} ausente ou de tipo inesperado.`);
  }
  return alvo;
}

const MAPA_ESCAPE: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/** Escapa texto vindo do Claude ou do usuário antes de entrar numa string HTML. */
export function esc(valor: string | number): string {
  return String(valor).replace(/[&<>"']/g, (c) => MAPA_ESCAPE[c] ?? c);
}
