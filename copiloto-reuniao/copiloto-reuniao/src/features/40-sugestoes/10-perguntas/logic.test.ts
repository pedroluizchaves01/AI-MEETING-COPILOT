/**
 * DMC:    CPR-40-10-00-700A
 * Título: Sugestões › Perguntas › Testes
 * BREX:   CPR-00-00-00-022A
 */
import { describe, expect, it } from 'vitest';
import { empilhar, marcar, montarPromptSugestoes, normalizarSugestoes } from './logic';

const ctx = { empresa: 'Acme', autor: 'Maria', objetivo: 'Briefing', participantes: 'João', pauta: 'prazo' };

describe('montarPromptSugestoes', () => {
  it('inclui contexto, trecho e histórico limitado', () => {
    const anteriores = Array.from({ length: 40 }, (_, i) => `P${i}?`);
    const p = montarPromptSugestoes({ ctx, resumo: '', recente: '[00:01] oi', anteriores, feitas: [] });
    expect(p).toContain('Maria (empresa Acme)');
    expect(p).toContain('[00:01] oi');
    expect(p).toContain('P39?');
    expect(p).not.toContain('P14?');
  });
  it('recusa trecho vazio', () => {
    expect(() => montarPromptSugestoes({ ctx, resumo: '', recente: ' ', anteriores: [], feitas: [] })).toThrow();
  });
});

describe('normalizarSugestoes', () => {
  it('aceita objeto ou lista, corta em 3 e remove repetidas', () => {
    const v = { perguntas: [{ pergunta: 'A?' }, { pergunta: 'a?' }, { pergunta: 'B?', tema: 'Prazo' }, { x: 1 }, { pergunta: 'C?' }, { pergunta: 'D?' }] };
    const r = normalizarSugestoes(v, 10, ['C?']);
    expect(r.map((s) => s.pergunta)).toEqual(['A?', 'B?', 'D?']);
    expect(r[1]?.tema).toBe('Prazo');
    expect(normalizarSugestoes([{ pergunta: 'X?' }], 1, [])).toHaveLength(1);
  });
  it('nunca lança com lixo', () => {
    expect(normalizarSugestoes('texto', 1, [])).toEqual([]);
    expect(normalizarSugestoes(null, 1, [])).toEqual([]);
  });
});

describe('empilhar e marcar', () => {
  it('novo lote vai para o topo e o destino muda sem mutar a lista', () => {
    const a = normalizarSugestoes([{ pergunta: 'A?' }], 1, []);
    const b = normalizarSugestoes([{ pergunta: 'B?' }], 2, []);
    const lista = empilhar(a, b);
    expect(lista.map((s) => s.pergunta)).toEqual(['B?', 'A?']);
    const marcada = marcar(lista, '1-0', 'feita');
    expect(marcada[1]?.destino).toBe('feita');
    expect(lista[1]?.destino).toBe('pendente');
  });
});
