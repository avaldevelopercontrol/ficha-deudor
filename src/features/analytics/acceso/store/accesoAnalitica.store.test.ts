import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../test/testHarness';

import type {
  AccesoAnaliticaContext,
} from '../domain/accesoAnalitica.types';
import {
  ANALYTICS_ACCESS_CACHE_TTL_MS,
  accesoAnaliticaStore,
} from './accesoAnalitica.store';

const access: AccesoAnaliticaContext = {
  scopes: [
    {
      crmClientId: 95,
      name: 'Cartera 95',
    },
  ],
};

export const suite = defineSuite(
  'accesoAnalitica.store',
  [
    test(
      'mantiene el acceso fresco hasta el límite exacto del TTL',
      () => {
        accesoAnaliticaStore.clear();
        const cachedAt = 10_000;

        accesoAnaliticaStore.setAccess(
          23,
          access,
          cachedAt
        );

        assert.equal(
          accesoAnaliticaStore.getFreshAccess(
            23,
            cachedAt +
              ANALYTICS_ACCESS_CACHE_TTL_MS -
              1
          ),
          access
        );
        assert.equal(
          accesoAnaliticaStore.isStale(
            23,
            cachedAt +
              ANALYTICS_ACCESS_CACHE_TTL_MS -
              1
          ),
          false
        );
        assert.equal(
          accesoAnaliticaStore.getFreshAccess(
            23,
            cachedAt +
              ANALYTICS_ACCESS_CACHE_TTL_MS
          ),
          null
        );
        assert.equal(
          accesoAnaliticaStore.isStale(
            23,
            cachedAt +
              ANALYTICS_ACCESS_CACHE_TTL_MS
          ),
          true
        );
      }
    ),
    test(
      'permite stale-while-revalidate sin ocultar el último valor cacheado',
      () => {
        accesoAnaliticaStore.clear();
        const cachedAt = 20_000;

        accesoAnaliticaStore.setAccess(
          23,
          access,
          cachedAt
        );

        const staleAt =
          cachedAt +
          ANALYTICS_ACCESS_CACHE_TTL_MS;

        assert.equal(
          accesoAnaliticaStore.getAccess(23),
          access
        );
        assert.equal(
          accesoAnaliticaStore.getFreshAccess(
            23,
            staleAt
          ),
          null
        );
      }
    ),
    test(
      'limpia una opción de forma aislada o toda la sesión',
      () => {
        accesoAnaliticaStore.clear();
        accesoAnaliticaStore.setAccess(
          23,
          access
        );
        accesoAnaliticaStore.setAccess(
          24,
          access
        );

        accesoAnaliticaStore.clear(23);

        assert.equal(
          accesoAnaliticaStore.getAccess(23),
          null
        );
        assert.equal(
          accesoAnaliticaStore.getAccess(24),
          access
        );

        accesoAnaliticaStore.clear();

        assert.equal(
          accesoAnaliticaStore.getAccess(24),
          null
        );
      }
    ),
  ]
);
