/**
 * DMC:    CPR-30-20-00-700A
 * Título: Reunião › Gatilho › Testes
 * BREX:   CPR-00-00-00-022A
 */
import { describe, expect, it } from 'vitest';
import { decidirGatilho, type EntradaGatilho } from './logic';

const base: EntradaGatilho = {
  agora: 100_000, ultimoSom: 99_000, ultimaChamada: 90_000, novosChars: 200, temParcial: false, pausaAte: 0, pronto: true,
};

describe('decidirGatilho', () => {
  it('dispara após 3 s de silêncio com fala nova', () => {
    expect(decidirGatilho({ ...base, ultimoSom: 97_000 })).toBe('pausa');
    expect(decidirGatilho({ ...base, ultimoSom: 97_001 })).toBeNull();
  });
  it('dispara a cada 60 s mesmo sem pausa', () => {
    expect(decidirGatilho({ ...base, temParcial: true, ultimaChamada: 40_000 })).toBe('ciclo');
  });
  it('não dispara com frase em andamento antes de 60 s', () => {
    expect(decidirGatilho({ ...base, ultimoSom: 50_000, temParcial: true })).toBeNull();
  });
  it('exige um mínimo de fala nova', () => {
    expect(decidirGatilho({ ...base, ultimoSom: 0, ultimaChamada: 0, novosChars: 29 })).toBeNull();
  });
  it('respeita pausa por limite de uso e o estado "pronto"', () => {
    expect(decidirGatilho({ ...base, ultimoSom: 0, pausaAte: 100_001 })).toBeNull();
    expect(decidirGatilho({ ...base, ultimoSom: 0, pronto: false })).toBeNull();
  });
  it('recusa regras inconsistentes', () => {
    expect(() => decidirGatilho(base, { pausaMs: 5000, cicloMs: 1000, minChars: 1 })).toThrow();
  });
});
