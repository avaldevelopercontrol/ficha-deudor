import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../test/testHarness';

import {
  clearSelectedCrmClientId,
  getSelectedCrmClientId,
  setSelectedCrmClientId,
} from './analyticsCrmSelection.storage';

const storage = new Map<string, string>();

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem(key: string) {
      return storage.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      storage.set(key, value);
    },
    removeItem(key: string) {
      storage.delete(key);
    },
  },
});

export const suite = defineSuite(
  'analyticsCrmSelection.storage',
  [
    test('persiste y recupera un crmClientId válido', () => {
      storage.clear();
      setSelectedCrmClientId(95);
      assert.equal(getSelectedCrmClientId(), 95);
    }),
    test('ignora valores inválidos almacenados', () => {
      storage.clear();
      storage.set('analytics.selectedCrmClientId', 'invalid');
      assert.equal(getSelectedCrmClientId(), null);
    }),
    test('permite limpiar la cartera seleccionada', () => {
      storage.clear();
      setSelectedCrmClientId(95);
      clearSelectedCrmClientId();
      assert.equal(getSelectedCrmClientId(), null);
    }),
  ]
);
