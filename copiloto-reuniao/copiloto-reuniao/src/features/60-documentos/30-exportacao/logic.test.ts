/**
 * DMC:    CPR-60-30-00-700A
 * Título: Documentos › Exportação › Testes
 * BREX:   CPR-00-00-00-022A
 */
import { describe, expect, it } from 'vitest';
import type { MetaAta } from '../10-ata/schemas';
import { nomeArquivo, transcricaoTexto } from './logic';

const m: MetaAta = { empresa: 'Acme/SA', autor: 'Maria', objetivo: 'Kickoff: fase 1', participantes: 'João', data: '24/11/2026', duracao: '5 min' };
const T0 = new Date(2026, 10, 24, 9, 30).getTime();

describe('nomeArquivo', () => {
  it('remove caracteres inválidos e usa a data com hífens', () => {
    expect(nomeArquivo('Ata', m.objetivo, m, 'pdf')).toBe('Ata - AcmeSA - Kickoff fase 1 - 24-11-2026.pdf');
    expect(nomeArquivo('Ata', '', { ...m, empresa: '' }, 'txt')).toBe('Ata - reunião - 24-11-2026.txt');
  });
});

describe('transcricaoTexto', () => {
  it('tem cabeçalho, linhas com tempo e CRLF', () => {
    const t = transcricaoTexto([{ t: T0 + 5000, texto: 'Olá', manual: false }, { t: T0 + 65000, texto: 'nota', manual: true }], T0, m);
    expect(t).toContain('Empresa: Acme/SA\r\nAutor: Maria');
    expect(t).toContain('Início: 09:30');
    expect(t).toContain('[00:05] Olá\r\n[01:05] (anotação manual) nota\r\n');
  });
  it('recusa transcrição vazia', () => {
    expect(() => transcricaoTexto([], T0, m)).toThrow();
  });
});
