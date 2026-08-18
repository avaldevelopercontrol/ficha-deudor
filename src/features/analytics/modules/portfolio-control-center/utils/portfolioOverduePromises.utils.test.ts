import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../../../test/testHarness';

import type {
  PortfolioOverduePromiseItem,
} from '../../../types/portfolioControlCenter.types';
import {
  filterPortfolioOverduePromisesByAging,
  sortPortfolioOverduePromises,
} from './portfolioOverduePromises.utils';

const createItem = (
  overrides: Partial<PortfolioOverduePromiseItem>
): PortfolioOverduePromiseItem => ({
  promiseId: '1',
  debtorId: '100',
  dueDate: '2026-08-10',
  overdueDays: 4,
  promiseAmount: 1000,
  paidAmount: 0,
  outstandingAmount: 1000,
  agingKey: '4-7',
  advisorId: '1',
  advisorName: 'ASESOR A',
  supervisorId: '1',
  supervisorName: 'SUPERVISOR A',
  ...overrides,
});

export const suite = defineSuite(
  'portfolioOverduePromises.utils',
  [
    test('filtra antigüedad completamente en memoria', () => {
      const items = [
        createItem({ promiseId: '1', agingKey: '1-3' }),
        createItem({ promiseId: '2', agingKey: '4-7' }),
        createItem({ promiseId: '3', agingKey: '8-plus' }),
      ];

      const result = filterPortfolioOverduePromisesByAging(
        items,
        '4-7'
      );

      assert.deepEqual(
        result.map((item) => item.promiseId),
        ['2']
      );
    }),
    test('ordena localmente por saldo pendiente sin mutar la fuente', () => {
      const items = [
        createItem({ promiseId: '1', outstandingAmount: 200 }),
        createItem({ promiseId: '2', outstandingAmount: 900 }),
        createItem({ promiseId: '3', outstandingAmount: 500 }),
      ];

      const result = sortPortfolioOverduePromises(
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
    test('mantiene valores sin atribución al final incluso en orden descendente', () => {
      const items = [
        createItem({ promiseId: '1', advisorName: null }),
        createItem({ promiseId: '2', advisorName: 'ZETA' }),
        createItem({ promiseId: '3', advisorName: 'ALFA' }),
      ];

      const result = sortPortfolioOverduePromises(
        items,
        'advisorName',
        'desc'
      );

      assert.deepEqual(
        result.map((item) => item.promiseId),
        ['2', '3', '1']
      );
    }),
  ]
);
