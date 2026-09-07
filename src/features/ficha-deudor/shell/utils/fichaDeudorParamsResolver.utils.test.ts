import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../../test/testHarness';
import type { FichaDeudorParams } from '../../shared/types/fichaDeudor.types';
import { resolveFichaDeudorParams } from './fichaDeudorParamsResolver.utils';

const locationParams: FichaDeudorParams = {
  id_cliente: '1',
  id_cartera: '2',
  id_deudor: '3',
  id_contrato: '4',
  id_usuario: '5',
  fecha_inicio_gestion: '2026-08-28T15:00:00.000',
};

const sessionParams: FichaDeudorParams = {
  ...locationParams,
  id_deudor: '30',
};

const legacySearch =
  '?id_cliente=1&id_cartera=2&id_deudor=20&id_contrato=4&id_usuario=5&fecha_inicio_gestion=2026-08-28T14%3A00%3A00.000';

const resolve = (overrides: Partial<Parameters<typeof resolveFichaDeudorParams>[0]> = {}) =>
  resolveFichaDeudorParams({
    locationState: null,
    search: '',
    sessionParams: null,
    defaultFechaInicioGestion: '2026-08-28T16:00:00.000',
    ...overrides,
  });

export const suite = defineSuite('fichaDeudorParamsResolver.utils', [
  test('prioriza location.state sobre URL legacy y sessionStorage', () => {
    const result = resolve({
      locationState: { fichaDeudorParams: locationParams },
      search: legacySearch,
      sessionParams,
    });

    assert.equal(result?.source, 'location-state');
    assert.equal(result?.params.id_deudor, '3');
  }),
  test('usa URL legacy cuando location.state no contiene parámetros válidos', () => {
    const result = resolve({
      locationState: { fichaDeudorParams: { ...locationParams, id_cliente: '0' } },
      search: legacySearch,
      sessionParams,
    });

    assert.equal(result?.source, 'legacy-url');
    assert.equal(result?.params.id_deudor, '20');
  }),
  test('usa sessionStorage únicamente como último fallback', () => {
    const result = resolve({
      search: '?id_cliente=1&id_cartera=2',
      sessionParams,
    });

    assert.equal(result?.source, 'session');
    assert.equal(result?.params.id_deudor, '30');
  }),
  test('usa la fecha por defecto solo cuando la URL legacy no la incluye', () => {
    const result = resolve({
      search: '?id_cliente=1&id_cartera=2&id_deudor=20&id_contrato=4&id_usuario=5',
    });

    assert.equal(result?.source, 'legacy-url');
    assert.equal(
      result?.params.fecha_inicio_gestion,
      '2026-08-28T16:00:00.000'
    );
  }),
  test('rechaza URL legacy parcial o con IDs no positivos', () => {
    assert.equal(
      resolve({ search: '?id_cliente=1&id_cartera=2' }),
      null
    );
    assert.equal(
      resolve({
        search:
          '?id_cliente=0&id_cartera=2&id_deudor=3&id_contrato=4&id_usuario=5',
      }),
      null
    );
  }),
  test('retorna null cuando ninguna fuente contiene parámetros válidos', () => {
    assert.equal(
      resolve({
        locationState: { fichaDeudorParams: { foo: 'bar' } },
        search: '?foo=bar',
        sessionParams: null,
      }),
      null
    );
  }),
]);
