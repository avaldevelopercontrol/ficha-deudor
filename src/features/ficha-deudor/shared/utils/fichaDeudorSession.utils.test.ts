import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../../test/testHarness';
import type { FichaDeudorParams } from '../types/fichaDeudor.types';
import {
  clearFichaDeudorSession,
  isFichaDeudorParams,
  loadFichaDeudorSession,
  saveFichaDeudorSession,
} from './fichaDeudorSession.utils';

class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length() { return this.data.size; }
  clear() { this.data.clear(); }
  getItem(key: string) { return this.data.get(key) ?? null; }
  key(index: number) { return [...this.data.keys()][index] ?? null; }
  removeItem(key: string) { this.data.delete(key); }
  setItem(key: string, value: string) { this.data.set(key, value); }
}

const params: FichaDeudorParams = {
  id_cliente: '1', id_cartera: '2', id_deudor: '3',
  id_contrato: '4', id_usuario: '5',
  fecha_inicio_gestion: '2026-08-04T09:17:00.000',
};

const withStorage = (run: (storage: Storage) => void) => {
  const storage = new MemoryStorage();
  Object.defineProperty(globalThis, 'sessionStorage', { configurable: true, value: storage });
  run(storage);
};

export const suite = defineSuite('fichaDeudorSession.utils', [
  test('valida únicamente contextos completos con IDs positivos', () => {
    assert.equal(isFichaDeudorParams(params), true);
    assert.equal(isFichaDeudorParams({ ...params, id_cliente: ' ' }), false);
    assert.equal(isFichaDeudorParams({ ...params, id_cliente: 'abc' }), false);
    assert.equal(isFichaDeudorParams({ ...params, id_cartera: '0' }), false);
    assert.equal(isFichaDeudorParams({ ...params, id_deudor: '-1' }), false);
    assert.equal(isFichaDeudorParams({ ...params, id_contrato: '1.5' }), false);
    assert.equal(isFichaDeudorParams(null), false);
  }),
  test('guarda y recupera el contexto activo', () => {
    withStorage(() => {
      saveFichaDeudorSession(params);
      assert.deepEqual(loadFichaDeudorSession(), params);
    });
  }),
  test('descarta y elimina contenido corrupto', () => {
    withStorage((storage) => {
      storage.setItem('ficha_deudor_active_context', '{invalid');
      assert.equal(loadFichaDeudorSession(), null);
      assert.equal(storage.length, 0);
    });
  }),
  test('limpia explícitamente el contexto', () => {
    withStorage((storage) => {
      saveFichaDeudorSession(params);
      clearFichaDeudorSession();
      assert.equal(storage.length, 0);
    });
  }),
]);
