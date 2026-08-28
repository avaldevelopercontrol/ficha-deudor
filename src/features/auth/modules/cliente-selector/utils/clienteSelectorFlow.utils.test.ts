import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../../../test/testHarness';
import { canContinueClienteSelector } from './clienteSelectorFlow.utils';

const createBaseParams = () => ({
  hasSelectedCliente: true,
  anios: [2026],
  selectedAnio: 2026 as number | '',
  carteras: [
    { campania: 1, anio: 2026, estado: 'Vigente', numero: 0 },
  ],
  hasSelectedCartera: true,
  isLoading: false,
  isAniosLoading: false,
  isCarterasLoading: false,
  hasLoadedAnios: true,
  hasLoadedCarteras: true,
  aniosError: null,
  carterasError: null,
});

export const suite = defineSuite('clienteSelectorFlow.utils', [
  test('permite continuar sin mostrar año cuando el cliente no tiene años', () => {
    assert.equal(
      canContinueClienteSelector({
        ...createBaseParams(),
        anios: [],
        selectedAnio: '',
        carteras: [],
        hasSelectedCartera: false,
        hasLoadedCarteras: false,
      }),
      true
    );
  }),
  test('permite continuar automáticamente cuando existe una sola cartera', () => {
    assert.equal(canContinueClienteSelector(createBaseParams()), true);
  }),
  test('exige selección cuando la API devuelve varias carteras', () => {
    const carteras = [
      { campania: 8, anio: 2026, estado: 'Vigente', numero: 0 },
      { campania: 7, anio: 2026, estado: 'Vigente', numero: 0 },
    ];

    assert.equal(
      canContinueClienteSelector({
        ...createBaseParams(),
        carteras,
        hasSelectedCartera: false,
      }),
      false
    );
    assert.equal(
      canContinueClienteSelector({
        ...createBaseParams(),
        carteras,
        hasSelectedCartera: true,
      }),
      true
    );
  }),
  test('no permite continuar si el año tiene cero carteras', () => {
    assert.equal(
      canContinueClienteSelector({
        ...createBaseParams(),
        carteras: [],
        hasSelectedCartera: false,
      }),
      false
    );
  }),
]);
