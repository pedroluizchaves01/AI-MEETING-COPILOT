/**
 * DMC:    CPR-60-10-00-700A
 * Título: Documentos › Ata › Testes
 * BREX:   CPR-00-00-00-022A
 */
import { describe, expect, it } from 'vitest';
import { ataTexto, montarMeta, normalizarAta } from './logic';

const ctx = { empresa: 'Acme', autor: 'Maria', objetivo: 'Briefing', participantes: 'João', pauta: '' };
const T0 = new Date(2026, 10, 24, 10, 0).getTime();

describe('montarMeta', () => {
  it('monta data, duração e participantes com o autor', () => {
    const m = montarMeta(ctx, T0, T0 + 47 * 60000);
    expect(m).toMatchObject({ empresa: 'Acme', data: '24/11/2026', duracao: '47 min', participantes: 'João; Maria' });
  });
});

describe('normalizarAta', () => {
  it('converte a resposta do Claude e preenche lacunas com travessão', () => {
    const a = normalizarAta({
      titulo: 'Kickoff', resumo: 'R', decisoes: ['D1', '', 3],
      pendencias: [{ item: 'Enviar proposta' }, { responsavel: 'sem item' }],
      perguntas_abertas: ['Q?'], proximos_passos: ['Passo'], informacoes: [{ tema: 'Prazo', detalhe: 'Março' }],
    });
    expect(a?.decisoes).toEqual(['D1']);
    expect(a?.pendencias).toEqual([{ item: 'Enviar proposta', responsavel: '—', prazo: '—' }]);
    expect(a?.perguntasAbertas).toEqual(['Q?']);
  });
  it('devolve null para resposta vazia ou inválida', () => {
    expect(normalizarAta({ titulo: 'só título' })).toBeNull();
    expect(normalizarAta([1, 2])).toBeNull();
    expect(normalizarAta('x')).toBeNull();
  });
});

describe('ataTexto', () => {
  it('gera texto com seções na ordem', () => {
    const a = normalizarAta({ resumo: 'R', decisoes: ['D1'], proximos_passos: ['P1'] });
    if (a === null) throw new Error('ata deveria existir');
    const t = ataTexto(a, montarMeta(ctx, T0, T0));
    expect(t.indexOf('RESUMO')).toBeLessThan(t.indexOf('DECISÕES'));
    expect(t).toContain('1. D1');
    expect(t).toContain('[ ] P1');
  });
});
