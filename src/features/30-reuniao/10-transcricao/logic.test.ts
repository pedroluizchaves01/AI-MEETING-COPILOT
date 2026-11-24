/**
 * DMC:    CPR-30-10-00-700A
 * Título: Reunião › Transcrição › Testes
 * BREX:   CPR-00-00-00-022A
 */
import { describe, expect, it } from 'vitest';
import { contarNovos, corpoParaAta, janelaRecente, novoSegmento, textoDe, trechoParaResumir } from './logic';
import type { Segmento } from './schemas';

const T0 = 1_700_000_000_000;
const seg = (seg: number, texto: string, manual = false): Segmento => ({ t: T0 + seg * 1000, texto, manual });

describe('novoSegmento', () => {
  it('ignora texto vazio e apara espaços', () => {
    expect(novoSegmento('   ', T0, false)).toBeNull();
    expect(novoSegmento('  oi ', T0, false)?.texto).toBe('oi');
  });
  it('rejeita instante inválido', () => {
    expect(() => novoSegmento('oi', 0, false)).toThrow();
  });
});

describe('textoDe', () => {
  it('formata tempo relativo e marca anotações', () => {
    const segs = [seg(0, 'Bom dia'), seg(75, 'trazer contrato', true)];
    expect(textoDe(segs, T0)).toBe('[00:00] Bom dia\n[01:15] (anotação) trazer contrato');
  });
});

describe('contarNovos', () => {
  it('soma segmentos após o índice e a fala parcial', () => {
    const segs = [seg(0, 'abc'), seg(1, 'defgh')];
    expect(contarNovos(segs, 1, ' xy ')).toBe(7);
    expect(contarNovos(segs, 5, '')).toBe(0);
  });
});

describe('janelaRecente', () => {
  it('limita a janela a ~2800 caracteres e acrescenta a fala parcial', () => {
    const segs = Array.from({ length: 100 }, (_, i) => seg(i, 'x'.repeat(100)));
    const janela = janelaRecente(segs, T0, 0, 'falando agora');
    expect(janela.split('\n')).toHaveLength(29);
    expect(janela.endsWith('[agora] falando agora')).toBe(true);
  });
  it('não volta antes do trecho já resumido', () => {
    const segs = Array.from({ length: 10 }, (_, i) => seg(i, `frase ${i}`));
    expect(janelaRecente(segs, T0, 8, '')).toBe('[00:08] frase 8\n[00:09] frase 9');
  });
});

describe('trechoParaResumir', () => {
  it('só resume quando o trecho antigo passa de 4000 caracteres', () => {
    const poucos = Array.from({ length: 50 }, (_, i) => seg(i, 'y'.repeat(100)));
    expect(trechoParaResumir(poucos, T0, 0)).toBeNull();
    const muitos = Array.from({ length: 80 }, (_, i) => seg(i, 'y'.repeat(100)));
    const r = trechoParaResumir(muitos, T0, 0);
    expect(r?.ate).toBe(60);
  });
});

describe('corpoParaAta', () => {
  it('usa resumo + final quando a transcrição é muito longa', () => {
    const segs = Array.from({ length: 700 }, (_, i) => seg(i, 'z'.repeat(100)));
    const corpo = corpoParaAta(segs, T0, 'RESUMO', 680);
    expect(corpo.startsWith('Resumo do início:\nRESUMO')).toBe(true);
    expect(corpo.length).toBeLessThan(3000);
  });
});
