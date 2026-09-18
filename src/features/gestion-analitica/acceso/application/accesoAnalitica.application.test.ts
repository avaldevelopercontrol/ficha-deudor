import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../test/testHarness';

import {
  cancelPendingAccesoAnalitica,
  clearAccesoAnaliticaSession,
  prefetchAccesoAnalitica,
} from '../services/accesoAnalitica.prefetch';
import {
  clearSelectedCrmClientId,
  getSelectedCrmClientId,
  setSelectedCrmClientId,
} from '../store/seleccionClienteCrmAnalitica.storage';
import {
  GESTION_ANALITICA_ACCESS_CACHE_TTL_MS,
  accesoAnaliticaStore,
} from '../store/accesoAnalitica.store';
import {
  cancelAccesoAnaliticaRequest,
  commitAccesoAnalitica,
  getAccesoAnaliticaSnapshot,
  isAnalyticsAbortError,
  prepareAccesoAnaliticaLoad,
  resolveSeleccionClienteCrmAnalitica,
  selectAnalyticsCrmClient,
} from './accesoAnalitica.application';

const storage = new Map<string, string>();

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem(key: string) {
      return storage.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      storage.set(key, value);
    },
    removeItem(key: string) {
      storage.delete(key);
    },
  },
});

const accessResponse = {
  optionId: 23,
  clients: [
    {
      clientId: 95,
      name: 'Cartera real',
    },
  ],
};

const access = {
  scopes: [
    { crmClientId: 10, name: 'A' },
    { crmClientId: 20, name: 'B' },
  ],
};

export const suite = defineSuite(
  'accesoAnalitica application',
  [
    test(
      'conserva la cartera almacenada cuando sigue autorizada',
      () => {
        assert.equal(
          resolveSeleccionClienteCrmAnalitica(
            access,
            20
          ),
          20
        );
      }
    ),
    test(
      'cae a la primera cartera autorizada si la almacenada dejó de existir',
      () => {
        assert.equal(
          resolveSeleccionClienteCrmAnalitica(
            access,
            99
          ),
          10
        );
      }
    ),
    test(
      'devuelve null cuando el usuario ya no tiene scopes Analytics',
      () => {
        assert.equal(
          resolveSeleccionClienteCrmAnalitica(
            { scopes: [] },
            20
          ),
          null
        );
      }
    ),
    test(
      'distingue cancelaciones AbortError de errores funcionales',
      () => {
        assert.equal(
          isAnalyticsAbortError({ name: 'AbortError' }),
          true
        );
        assert.equal(
          isAnalyticsAbortError(new Error('fallo')),
          false
        );
      }
    ),
    test(
      'expone cache vencida como snapshot pero prepara revalidación de red',
      async () => {
        clearAccesoAnaliticaSession();
        clearSelectedCrmClientId();
        const originalFetch = globalThis.fetch;

        accesoAnaliticaStore.setAccess(
          23,
          access,
          Date.now() -
            GESTION_ANALITICA_ACCESS_CACHE_TTL_MS -
            1
        );
        setSelectedCrmClientId(20);

        globalThis.fetch = async () =>
          Response.json(accessResponse);

        try {
          const snapshot =
            getAccesoAnaliticaSnapshot(23);

          assert.equal(snapshot.access, access);
          assert.equal(
            snapshot.selectedCrmClientId,
            20
          );

          const operation =
            prepareAccesoAnaliticaLoad(23);

          assert.equal(
            operation.kind,
            'request'
          );

          if (operation.kind === 'request') {
            const result =
              await operation.request.promise;

            assert.equal(
              result.scopes[0]?.crmClientId,
              95
            );
          }
        } finally {
          globalThis.fetch = originalFetch;
          clearAccesoAnaliticaSession();
          clearSelectedCrmClientId();
        }
      }
    ),
    test(
      'reutiliza cache fresca sin iniciar red',
      () => {
        clearAccesoAnaliticaSession();
        accesoAnaliticaStore.setAccess(23, access);

        try {
          const operation =
            prepareAccesoAnaliticaLoad(23);

          assert.equal(operation.kind, 'cache');

          if (operation.kind === 'cache') {
            assert.equal(operation.access, access);
          }
        } finally {
          clearAccesoAnaliticaSession();
        }
      }
    ),
    test(
      'continúa con una solicitud propia si otro consumidor cancela el prefetch compartido',
      async () => {
        clearAccesoAnaliticaSession();
        const originalFetch = globalThis.fetch;
        let requestCount = 0;

        globalThis.fetch = async (
          _input,
          init
        ) => {
          requestCount++;

          if (requestCount === 1) {
            return await new Promise<Response>(
              (_resolve, reject) => {
                init?.signal?.addEventListener(
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
          }

          return Response.json(accessResponse);
        };

        try {
          const pendingPrefetch =
            prefetchAccesoAnalitica(23);
          const prefetchRejected =
            assert.rejects(
              pendingPrefetch,
              (reason) =>
                isAnalyticsAbortError(reason)
            );

          const operation =
            prepareAccesoAnaliticaLoad(23);

          assert.equal(
            operation.kind,
            'request'
          );

          cancelPendingAccesoAnalitica(23);
          await prefetchRejected;

          if (operation.kind === 'request') {
            const result =
              await operation.request.promise;

            assert.equal(requestCount, 2);
            assert.equal(
              result.scopes[0]?.crmClientId,
              95
            );
          }
        } finally {
          globalThis.fetch = originalFetch;
          clearAccesoAnaliticaSession();
        }
      }
    ),
    test(
      'force refresh invalida el prefetch y ejecuta una solicitud propia',
      async () => {
        clearAccesoAnaliticaSession();
        const originalFetch = globalThis.fetch;
        let requestCount = 0;
        const firstSignal: { value: AbortSignal | null } = { value: null };

        globalThis.fetch = async (
          _input,
          init
        ) => {
          requestCount++;

          if (requestCount === 1) {
            firstSignal.value = init?.signal ?? null;

            return await new Promise<Response>(
              (_resolve, reject) => {
                init?.signal?.addEventListener(
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
          }

          return Response.json(accessResponse);
        };

        try {
          const pendingPrefetch =
            prefetchAccesoAnalitica(23);
          const prefetchRejected =
            assert.rejects(
              pendingPrefetch,
              (reason) =>
                isAnalyticsAbortError(reason)
            );

          const operation =
            prepareAccesoAnaliticaLoad(
              23,
              true
            );

          assert.equal(
            firstSignal.value?.aborted,
            true
          );
          await prefetchRejected;

          assert.equal(
            operation.kind,
            'request'
          );

          if (operation.kind === 'request') {
            await operation.request.promise;
            assert.equal(requestCount, 2);
          }
        } finally {
          globalThis.fetch = originalFetch;
          clearAccesoAnaliticaSession();
        }
      }
    ),
    test(
      'commit sincroniza cache y selección global autorizada',
      () => {
        clearAccesoAnaliticaSession();
        clearSelectedCrmClientId();
        setSelectedCrmClientId(20);

        try {
          const selected =
            commitAccesoAnalitica(
              23,
              access
            );

          assert.equal(selected, 20);
          assert.equal(
            accesoAnaliticaStore.getAccess(23),
            access
          );
          assert.equal(
            getSelectedCrmClientId(),
            20
          );
        } finally {
          clearAccesoAnaliticaSession();
          clearSelectedCrmClientId();
        }
      }
    ),
    test(
      'selección manual rechaza una cartera fuera de los scopes',
      () => {
        clearSelectedCrmClientId();

        try {
          assert.throws(
            () =>
              selectAnalyticsCrmClient(
                access,
                99
              ),
            /no está autorizada/i
          );

          assert.equal(
            getSelectedCrmClientId(),
            null
          );
        } finally {
          clearSelectedCrmClientId();
        }
      }
    ),
    test(
      'cancelación explícita aborta una carga activa',
      async () => {
        clearAccesoAnaliticaSession();
        const originalFetch = globalThis.fetch;

        globalThis.fetch = async (
          _input,
          init
        ) =>
          await new Promise<Response>(
            (_resolve, reject) => {
              init?.signal?.addEventListener(
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

        try {
          const operation =
            prepareAccesoAnaliticaLoad(23);

          assert.equal(
            operation.kind,
            'request'
          );

          if (operation.kind === 'request') {
            const rejected = assert.rejects(
              operation.request.promise,
              (reason) =>
                isAnalyticsAbortError(reason)
            );

            cancelAccesoAnaliticaRequest(
              operation.request
            );

            assert.equal(
              operation.request.controller.signal
                .aborted,
              true
            );
            await rejected;
          }
        } finally {
          globalThis.fetch = originalFetch;
          clearAccesoAnaliticaSession();
        }
      }
    ),
  ]
);
