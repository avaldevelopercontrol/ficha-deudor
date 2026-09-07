import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../test/testHarness';

import type {
  AnalyticsAccessContext,
} from '../types/analyticsAccess.types';
import {
  ANALYTICS_ACCESS_CACHE_TTL_MS,
  analyticsAccessStore,
} from './analyticsAccess.store';

const access: AnalyticsAccessContext = {
  scopes: [
    {
      crmClientId: 95,
      name: 'Cartera 95',
    },
  ],
};

export const suite = defineSuite(
  'analyticsAccess.store',
  [
    test(
      'mantiene el acceso fresco hasta el límite exacto del TTL',
      () => {
        analyticsAccessStore.clear();
        const cachedAt = 10_000;

        analyticsAccessStore.setAccess(
          23,
          access,
          cachedAt
        );

        assert.equal(
          analyticsAccessStore.getFreshAccess(
            23,
            cachedAt +
              ANALYTICS_ACCESS_CACHE_TTL_MS -
              1
          ),
          access
        );
        assert.equal(
          analyticsAccessStore.isStale(
            23,
            cachedAt +
              ANALYTICS_ACCESS_CACHE_TTL_MS -
              1
          ),
          false
        );
        assert.equal(
          analyticsAccessStore.getFreshAccess(
            23,
            cachedAt +
              ANALYTICS_ACCESS_CACHE_TTL_MS
          ),
          null
        );
        assert.equal(
          analyticsAccessStore.isStale(
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
        analyticsAccessStore.clear();
        const cachedAt = 20_000;

        analyticsAccessStore.setAccess(
          23,
          access,
          cachedAt
        );

        const staleAt =
          cachedAt +
          ANALYTICS_ACCESS_CACHE_TTL_MS;

        assert.equal(
          analyticsAccessStore.getAccess(23),
          access
        );
        assert.equal(
          analyticsAccessStore.getFreshAccess(
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
        analyticsAccessStore.clear();
        analyticsAccessStore.setAccess(
          23,
          access
        );
        analyticsAccessStore.setAccess(
          24,
          access
        );

        analyticsAccessStore.clear(23);

        assert.equal(
          analyticsAccessStore.getAccess(23),
          null
        );
        assert.equal(
          analyticsAccessStore.getAccess(24),
          access
        );

        analyticsAccessStore.clear();

        assert.equal(
          analyticsAccessStore.getAccess(24),
          null
        );
      }
    ),
  ]
);
