/**
 * DMC:    CPR-60-20-00-700A
 * Título: Documentos › PDF › Testes
 * BREX:   CPR-00-00-00-022A
 */
import { readFileSync } from 'node:fs';
import { jsPDF } from 'jspdf';
import { describe, expect, it } from 'vitest';
import { normalizarAta } from '../10-ata/logic';
import type { MetaAta } from '../10-ata/schemas';
import { gerarPDF } from './logic';

const fonte = (n: string): string => readFileSync(new URL(`../../../../assets/fonts/${n}`, import.meta.url)).toString('base64');
const fontes = { regular: fonte('Poppins-Regular.ttf'), seminegrito: fonte('Poppins-SemiBold.ttf') };
const m: MetaAta = { empresa: 'Acme', autor: 'Maria', objetivo: 'Briefing', participantes: 'João; Maria', data: '24/11/2026', duracao: '40 min' };

describe('gerarPDF', () => {
  it('gera um PDF válido de uma página para uma ata curta', () => {
    const a = normalizarAta({ resumo: 'Resumo curto com acentuação: ação, decisão.', decisoes: ['Uma'] });
    if (a === null) throw new Error('ata deveria existir');
    const doc = gerarPDF(jsPDF, a, m, fontes);
    expect(doc.getNumberOfPages()).toBe(1);
    expect(doc.output().startsWith('%PDF-')).toBe(true);
  });
  it('quebra páginas em atas longas', () => {
    const pendencias = Array.from({ length: 60 }, (_, i) => ({ item: `Pendência ${i} com descrição razoavelmente longa para quebrar linha`, responsavel: 'Cliente', prazo: '05/12' }));
    const a = normalizarAta({ resumo: 'R', pendencias });
    if (a === null) throw new Error('ata deveria existir');
    expect(gerarPDF(jsPDF, a, m, fontes).getNumberOfPages()).toBeGreaterThan(2);
  });
  it('exige as fontes', () => {
    const a = normalizarAta({ resumo: 'R' });
    if (a === null) throw new Error('ata deveria existir');
    expect(() => gerarPDF(jsPDF, a, m, { regular: '', seminegrito: '' })).toThrow();
  });
});
