/**
 * DMC:    CPR-00-30-00-200A
 * Título: Núcleo › Tempo › Formatação de duração e datas
 * BREX:   CPR-00-00-00-022A
 */

/** Converte milissegundos em "mm:ss". Valores negativos viram 00:00. */
export function mmss(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(total / 60);
  const seg = total % 60;
  return `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`;
}

/** Duração arredondada em minutos, mínimo de 1 minuto. */
export function duracaoMin(inicio: number, fim: number): string {
  const min = Math.max(1, Math.round((fim - inicio) / 60000));
  return `${min} min`;
}

/** Data no padrão brasileiro dd/mm/aaaa. */
export function dataBR(ms: number): string {
  return new Date(ms).toLocaleDateString('pt-BR');
}

/** Hora no padrão brasileiro hh:mm. */
export function horaBR(ms: number): string {
  return new Date(ms).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}
