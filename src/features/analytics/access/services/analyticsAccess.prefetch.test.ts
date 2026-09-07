import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../test/testHarness';

import {
  analyticsAccessStore,
} from '../store/analyticsAccess.store';
import {
  cancelPendingAnalyticsAccess,
  clearAnalyticsAccessSession,
  createAnalyticsAccessRequestController,
  getPendingAnalyticsAccess,
  prefetchAnalyticsAccess,
  releaseAnalyticsAccessRequestController,
} from './analyticsAccess.prefetch';

const accessResponse = {
  optionId: 23,
  clients: [
    {
      clientId: 95,
      name: 'Cartera real',
    },
  ],
};

const isAbortError = (reason: unknown): boolean =>
  typeof reason === 'object' &&
  reason !== null &&
  'name' in reason &&
  reason.name === 'AbortError';

export const suite = defineSuite(
  'analyticsAccess.prefetch',
  [
    test(
      'reutiliza cache fresca sin iniciar una solicitud HTTP',
      async () => {
        clearAnalyticsAccessSession();
        const originalFetch = globalThis.fetch;
        let requestCount = 0;
        const cached = {
          scopes: [
            {
              crmClientId: 95,
              name: 'Cache',
            },
          ],
        };

        analyticsAccessStore.setAccess(
          23,
          cached
        );
        globalThis.fetch = async () => {
          requestCount++;
          throw new Error(
            'No debería ejecutar HTTP con cache fresca.'
          );
        };

        try {
          const result =
            await prefetchAnalyticsAccess(23);

          assert.equal(requestCount, 0);
          assert.equal(result, cached);
        } finally {
          globalThis.fetch = originalFetch;
          clearAnalyticsAccessSession();
        }
      }
    ),
    test(
      'deduplica prefetch concurrente por optionId y comparte la misma Promise',
      async () => {
        clearAnalyticsAccessSession();
        const originalFetch = globalThis.fetch;
        let requestCount = 0;
        const deferred: {
          resolve?: (response: Response) => void;
        } = {};

        globalThis.fetch = async () => {
          requestCount++;

          return await new Promise<Response>(
            (resolve) => {
              deferred.resolve = resolve;
            }
          );
        };

        try {
          const first =
            prefetchAnalyticsAccess(23);
          const second =
            prefetchAnalyticsAccess(23);

          assert.equal(requestCount, 1);
          assert.equal(first, second);
          assert.equal(
            getPendingAnalyticsAccess(23),
            first
          );

          assert.ok(deferred.resolve);
          deferred.resolve(
            Response.json(accessResponse)
          );

          const result = await first;

          assert.deepEqual(result.scopes, [
            {
              crmClientId: 95,
              name: 'Cartera real',
            },
          ]);
          assert.equal(
            analyticsAccessStore.getAccess(23),
            result
          );
          assert.equal(
            getPendingAnalyticsAccess(23),
            null
          );
        } finally {
          globalThis.fetch = originalFetch;
          clearAnalyticsAccessSession();
        }
      }
    ),
    test(
      'libera una solicitud fallida para permitir un reintento posterior',
      async () => {
        clearAnalyticsAccessSession();
        const originalFetch = globalThis.fetch;
        let requestCount = 0;

        globalThis.fetch = async () => {
          requestCount++;

          if (requestCount === 1) {
            return Response.json(
              { message: 'fallo temporal' },
              { status: 503 }
            );
          }

          return Response.json(accessResponse);
        };

        try {
          await assert.rejects(
            () => prefetchAnalyticsAccess(23),
            /fallo temporal/
          );
          assert.equal(
            getPendingAnalyticsAccess(23),
            null
          );

          const result =
            await prefetchAnalyticsAccess(23);

          assert.equal(requestCount, 2);
          assert.equal(
            result.scopes[0]?.crmClientId,
            95
          );
        } finally {
          globalThis.fetch = originalFetch;
          clearAnalyticsAccessSession();
        }
      }
    ),
    test(
      'cancela un prefetch por opción y no conserva una request abortada',
      async () => {
        clearAnalyticsAccessSession();
        const originalFetch = globalThis.fetch;
        const observedSignal: {
          value: AbortSignal | null;
        } = { value: null };

        globalThis.fetch = async (
          _input,
          init
        ) => {
          observedSignal.value =
            init?.signal ?? null;

          return await new Promise<Response>(
            (_resolve, reject) => {
              observedSignal.value?.addEventListener(
                'abort',
                () => {
                  reject(
                    new DOMException(
                      'Aborted',
                      'AbortError'
                    )
                  );
                },
                { once: true }
              );
            }
          );
        };

        try {
          const pending =
            prefetchAnalyticsAccess(23);
          const rejected = assert.rejects(
            pending,
            isAbortError
          );

          cancelPendingAnalyticsAccess(23);

          assert.equal(
            observedSignal.value?.aborted,
            true
          );
          assert.equal(
            getPendingAnalyticsAccess(23),
            null
          );

          await rejected;
          assert.equal(
            analyticsAccessStore.getAccess(23),
            null
          );
        } finally {
          globalThis.fetch = originalFetch;
          clearAnalyticsAccessSession();
        }
      }
    ),
    test(
      'clear aborta también controladores activos que no pertenecen al prefetch',
      () => {
        clearAnalyticsAccessSession();
        const controller =
          createAnalyticsAccessRequestController();

        assert.equal(
          controller.signal.aborted,
          false
        );

        clearAnalyticsAccessSession();

        assert.equal(
          controller.signal.aborted,
          true
        );
        releaseAnalyticsAccessRequestController(
          controller
        );
      }
    ),
    test(
      'clear impide que una respuesta tardía vuelva a poblar cache aunque fetch ignore AbortSignal',
      async () => {
        clearAnalyticsAccessSession();
        const originalFetch = globalThis.fetch;
        const deferred: {
          resolve?: (response: Response) => void;
        } = {};
        const observedSignal: {
          value: AbortSignal | null;
        } = { value: null };

        globalThis.fetch = async (
          _input,
          init
        ) => {
          observedSignal.value =
            init?.signal ?? null;

          return await new Promise<Response>(
            (resolve) => {
              deferred.resolve = resolve;
            }
          );
        };

        try {
          const pending =
            prefetchAnalyticsAccess(23);

          clearAnalyticsAccessSession();

          assert.equal(
            observedSignal.value?.aborted,
            true
          );
          assert.equal(
            getPendingAnalyticsAccess(23),
            null
          );

          assert.ok(deferred.resolve);
          deferred.resolve(
            Response.json(accessResponse)
          );
          await pending;

          assert.equal(
            analyticsAccessStore.getAccess(23),
            null
          );
        } finally {
          globalThis.fetch = originalFetch;
          clearAnalyticsAccessSession();
        }
      }
    ),
  ]
);
