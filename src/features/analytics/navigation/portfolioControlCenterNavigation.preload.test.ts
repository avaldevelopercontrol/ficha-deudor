import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../test/testHarness';
import { clearAnalyticsAccessSession } from '../access/services/analyticsAccess.prefetch';
import {
  loadPortfolioControlCenterPage,
  preloadPortfolioControlCenterNavigation,
} from './portfolioControlCenterNavigation.preload';

const waitForAsyncWork = () => new Promise<void>((resolve) => setTimeout(resolve, 30));

export const suite = defineSuite('Portfolio Control Center navigation preload', [
  test('deduplica el import dinámico de la página', async () => {
    const first = loadPortfolioControlCenterPage();
    const second = loadPortfolioControlCenterPage();

    assert.equal(first, second);
    const module = await first;
    assert.equal(typeof module.default, 'function');
  }),
  test('un fallo de prefetch Analytics no genera unhandled rejection', async () => {
    clearAnalyticsAccessSession();
    const originalFetch = globalThis.fetch;
    let unhandled: unknown = null;
    const listener = (reason: unknown) => {
      unhandled = reason;
    };
    process.once('unhandledRejection', listener);

    globalThis.fetch = async () =>
      Response.json({ message: 'fallo temporal de preload' }, { status: 503 });

    try {
      preloadPortfolioControlCenterNavigation();
      await waitForAsyncWork();
      assert.equal(unhandled, null);
    } finally {
      process.removeListener('unhandledRejection', listener);
      globalThis.fetch = originalFetch;
      clearAnalyticsAccessSession();
    }
  }),
]);
