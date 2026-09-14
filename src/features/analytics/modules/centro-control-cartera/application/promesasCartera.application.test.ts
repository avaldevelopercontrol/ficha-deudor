import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import {
  buildPromesasCarteraVenceHoyQuery,
  buildPromesasCarteraVencidasQuery,
  buildSeguimientoPromesasCarteraQuery,
} from './promesasCartera.application';

export const suite = defineSuite(
  'promesasCartera.application',
  [
    test('normaliza aging all a null conservando paginación y orden', () => {
      assert.deepEqual(
        buildPromesasCarteraVencidasQuery(
          2,
          50,
          'all',
          'outstandingAmount',
          'desc'
        ),
        {
          page: 2,
          pageSize: 50,
          aging: null,
          sortBy: 'outstandingAmount',
          sortDirection: 'desc',
        }
      );
    }),
    test('normaliza status all a null conservando paginación y orden', () => {
      assert.deepEqual(
        buildPromesasCarteraVenceHoyQuery(
          1,
          25,
          'all',
          'debtorId',
          'asc'
        ),
        {
          page: 1,
          pageSize: 25,
          status: null,
          sortBy: 'debtorId',
          sortDirection: 'asc',
        }
      );
    }),
    test('construye seguimiento por fecha sin acoplar Hoy/Ayer al contrato HTTP', () => {
      assert.deepEqual(
        buildSeguimientoPromesasCarteraQuery(
          '2026-09-13',
          1,
          10,
          'all',
          'outstandingAmount',
          'desc'
        ),
        {
          dueDate: '2026-09-13',
          page: 1,
          pageSize: 10,
          status: null,
          sortBy: 'outstandingAmount',
          sortDirection: 'desc',
        }
      );
    }),
  ]
);
