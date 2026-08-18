import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../../../test/testHarness';

import type {
  PortfolioDueTodayPromiseItem,
} from '../../../types/portfolioControlCenter.types';
import {
  filterPortfolioDueTodayPromisesByStatus,
  sortPortfolioDueTodayPromises,
} from './portfolioDueTodayPromises.utils';

const createItem = (
  overrides: Partial<PortfolioDueTodayPromiseItem>
): PortfolioDueTodayPromiseItem => ({
  promiseId: '1',
  debtorId: '100',
  promiseAmount: 1000,
  paidAmount: 0,
  outstandingAmount: 1000,
  statusKey: 'pending',
  statusLabel: 'Pendiente',
  lastPaymentDate: null,
  advisorId: '1',
  advisorName: 'ASESOR A',
  supervisorId: '1',
  supervisorName: 'SUPERVISOR A',
  ...overrides,
});

export const suite = defineSuite(
  'portfolioDueTodayPromises.utils',
  [
    test('filtra estado completamente en memoria', () => {
      const items = [
        createItem({ promiseId: '1', statusKey: 'pending' }),
        createItem({ promiseId: '2', statusKey: 'partial' }),
        createItem({ promiseId: '3', statusKey: 'covered' }),
      ];

      const result = filterPortfolioDueTodayPromisesByStatus(
        items,
        'partial'
      );

      assert.deepEqual(
        result.map((item) => item.promiseId),
        ['2']
      );
    }),
    test('ordena localmente por saldo pendiente sin mutar la fuente', () => {
      const items = [
        createItem({ promiseId: '1', outstandingAmount: 20 }),
        createItem({ promiseId: '2', outstandingAmount: 90 }),
        createItem({ promiseId: '3', outstandingAmount: 50 }),
      ];

      const result = sortPortfolioDueTodayPromises(
        items,
        'outstandingAmount',
        'desc'
      );

      assert.deepEqual(
        result.map((item) => item.promiseId),
        ['2', '3', '1']
      );
      assert.deepEqual(
        items.map((item) => item.promiseId),
        ['1', '2', '3']
      );
    }),
    test('mantiene fechas de último pago vacías al final', () => {
      const items = [
        createItem({ promiseId: '1', lastPaymentDate: null }),
        createItem({ promiseId: '2', lastPaymentDate: '2026-08-18' }),
        createItem({ promiseId: '3', lastPaymentDate: '2026-08-17' }),
      ];

      const result = sortPortfolioDueTodayPromises(
        items,
        'lastPaymentDate',
        'desc'
      );

      assert.deepEqual(
        result.map((item) => item.promiseId),
        ['2', '3', '1']
      );
    }),
  ]
);
