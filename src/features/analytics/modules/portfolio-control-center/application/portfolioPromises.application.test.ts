import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import {
  buildPortfolioDueTodayPromisesQuery,
  buildPortfolioOverduePromisesQuery,
} from './portfolioPromises.application';

export const suite = defineSuite(
  'portfolioPromises.application',
  [
    test('normaliza aging all a null conservando paginación y orden', () => {
      assert.deepEqual(
        buildPortfolioOverduePromisesQuery(
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
        buildPortfolioDueTodayPromisesQuery(
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
  ]
);
