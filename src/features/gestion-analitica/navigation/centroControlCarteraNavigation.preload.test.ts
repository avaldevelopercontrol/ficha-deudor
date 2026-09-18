import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../test/testHarness';
import { clearAccesoAnaliticaSession } from '../acceso/services/accesoAnalitica.prefetch';
import {
  loadCentroControlCarteraPage,
  preloadCentroControlCarteraNavigation,
} from './centroControlCarteraNavigation.preload';

const waitForAsyncWork = () => new Promise<void>((resolve) => setTimeout(resolve, 30));

export const suite = defineSuite('Centro Control de Cartera navigation preload', [
  test('deduplica el import dinámico de la página', async () => {
    const first = loadCentroControlCarteraPage();
    const second = loadCentroControlCarteraPage();

    assert.equal(first, second);
    const module = await first;
    assert.equal(typeof module.default, 'function');
  }),
  test('un fallo de prefetch Analytics no genera unhandled rejection', async () => {
    clearAccesoAnaliticaSession();
    const originalFetch = globalThis.fetch;
    let unhandled: unknown = null;
    const listener = (reason: unknown) => {
      unhandled = reason;
    };
    process.once('unhandledRejection', listener);

    globalThis.fetch = async () =>
      Response.json({ message: 'fallo temporal de preload' }, { status: 503 });

    try {
      preloadCentroControlCarteraNavigation();
      await waitForAsyncWork();
      assert.equal(unhandled, null);
    } finally {
      process.removeListener('unhandledRejection', listener);
      globalThis.fetch = originalFetch;
      clearAccesoAnaliticaSession();
    }
  }),
]);
