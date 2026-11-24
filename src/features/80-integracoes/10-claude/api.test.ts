/**
 * DMC:    CPR-80-10-00-700A
 * Título: Integrações › Claude › Testes
 * BREX:   CPR-00-00-00-022A
 */
import { describe, expect, it } from 'vitest';
import { codigoErro, lerJSON, pedirJSON } from './api';
import type { Sample } from './schemas';

describe('lerJSON', () => {
  it('lê JSON puro ou cercado de texto', () => {
    expect(lerJSON('{"a":1}')).toEqual({ a: 1 });
    expect(lerJSON('Claro! {"a":2} Pronto.')).toEqual({ a: 2 });
    expect(lerJSON('sem json')).toBeNull();
  });
});

describe('codigoErro', () => {
  it('reconhece códigos da plataforma e aborto', () => {
    expect(codigoErro({ code: 'rate_limited' })).toBe('rate_limited');
    expect(codigoErro({ message: 'not_granted by viewer' })).toBe('not_granted');
    expect(codigoErro(new DOMException('x', 'AbortError'))).toBe('abortado');
    expect(codigoErro('?')).toBe('falha');
  });
});

describe('pedirJSON', () => {
  it('usa sample.json quando existe e cai para texto quando não', async () => {
    const comJson: Sample = Object.assign(() => Promise.resolve({ text: '' }), { json: () => Promise.resolve({ ok: 1 }) });
    const soTexto: Sample = () => Promise.resolve({ text: 'resposta: {"ok":2}' });
    await expect(pedirJSON(comJson, 'p', {})).resolves.toEqual({ ok: 1 });
    await expect(pedirJSON(soTexto, 'p', {})).resolves.toEqual({ ok: 2 });
  });
});
