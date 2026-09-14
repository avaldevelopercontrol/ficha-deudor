import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import { isPortfolioPromiseSortKey } from './useDetallePromesaCarteraTableState';

const SORT_KEYS = ['debtorId', 'promiseAmount'] as const;

export const suite = defineSuite(
  'useDetallePromesaCarteraTableState helpers',
  [
    test('acepta únicamente claves declaradas por la tabla', () => {
      assert.equal(isPortfolioPromiseSortKey('debtorId', SORT_KEYS), true);
      assert.equal(isPortfolioPromiseSortKey('unexpected', SORT_KEYS), false);
    }),
  ]
);
