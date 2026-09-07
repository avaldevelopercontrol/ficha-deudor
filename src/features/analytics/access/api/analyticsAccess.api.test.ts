import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../test/testHarness';

import {
  getAnalyticsAccess,
  getAnalyticsPowerBiOptionAccess,
  getAnalyticsPowerBiViewerContext,
} from './analyticsAccess.api';

export const suite = defineSuite(
  'analyticsAccess.api',
  [
    test(
      'resuelve autorización y nombres de cartera con una sola solicitud Analytics',
      async () => {
        const originalFetch = globalThis.fetch;
        let requestCount = 0;
        let legacyRequestCount = 0;

        globalThis.fetch = async (input) => {
          const url = String(input);

          if (url.includes('/analytics-access/user/options/23/clients')) {
            requestCount++;
            return Response.json({
              optionId: 23,
              clientIds: [95],
              clients: [
                {
                  clientId: 95,
                  name: 'Cartera real',
                },
              ],
            });
          }

          if (url.includes('/v1/Cliente/GetClientesActivos')) {
            legacyRequestCount++;
          }

          throw new Error(`Request inesperada: ${url}`);
        };

        try {
          const result = await getAnalyticsAccess(23);

          assert.equal(requestCount, 1);
          assert.equal(legacyRequestCount, 0);
          assert.deepEqual(result.scopes, [
            {
              crmClientId: 95,
              name: 'Cartera real',
            },
          ]);
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
    test(
      'mantiene compatibilidad con instancias backend que todavía responden solo clientIds',
      async () => {
        const originalFetch = globalThis.fetch;
        let requestCount = 0;

        globalThis.fetch = async (input) => {
          const url = String(input);

          if (url.includes('/analytics-access/user/options/23/clients')) {
            requestCount++;
            return Response.json({
              optionId: 23,
              clientIds: [120, 95, 95],
            });
          }

          throw new Error(`Request inesperada: ${url}`);
        };

        try {
          const result = await getAnalyticsAccess(23);

          assert.equal(requestCount, 1);
          assert.deepEqual(result.scopes, [
            {
              crmClientId: 95,
              name: 'Cartera 95',
            },
            {
              crmClientId: 120,
              name: 'Cartera 120',
            },
          ]);
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
    test(
      'prioriza el nombre enriquecido y completa ids autorizados sin nombre',
      async () => {
        const originalFetch = globalThis.fetch;

        globalThis.fetch = async (input) => {
          const url = String(input);

          if (url.includes('/analytics-access/user/options/23/clients')) {
            return Response.json({
              optionId: 23,
              clientIds: [95, 120],
              clients: [
                { clientId: 95, name: '  CLARO  ' },
              ],
            });
          }

          throw new Error(`Request inesperada: ${url}`);
        };

        try {
          const result = await getAnalyticsAccess(23);

          assert.deepEqual(result.scopes, [
            { crmClientId: 95, name: 'CLARO' },
            { crmClientId: 120, name: 'Cartera 120' },
          ]);
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
    test(
      'resuelve el acceso de varios reportes Power BI con una sola solicitud',
      async () => {
        const originalFetch = globalThis.fetch;
        let requestCount = 0;
        let requestedUrl = '';
        let requestedMethod = '';

        globalThis.fetch = async (
          input,
          init
        ) => {
          requestCount++;
          requestedUrl = String(input);
          requestedMethod = init?.method ?? '';

          return Response.json({
            options: [
              {
                optionId: 29,
                allowed: false,
                requiresClientSelection: true,
              },
              {
                optionId: 27,
                allowed: true,
                requiresClientSelection: true,
              },
            ],
          });
        };

        try {
          const result =
            await getAnalyticsPowerBiOptionAccess(
              [29, 27, 27, -1]
            );

          assert.equal(requestCount, 1);
          assert.equal(requestedMethod, 'GET');
          assert.match(
            requestedUrl,
            /\/api\/v1\/analytics-access\/user\/power-bi-access\?optionIds=27%2C29$/
          );
          assert.deepEqual(result, [
            {
              optionId: 27,
              allowed: true,
              requiresClientSelection: true,
            },
            {
              optionId: 29,
              allowed: false,
              requiresClientSelection: false,
            },
          ]);
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),

    test(
      'rechaza una respuesta batch incompleta para mantener el acceso fail-closed',
      async () => {
        const originalFetch = globalThis.fetch;

        globalThis.fetch = async () =>
          Response.json({
            options: [
              {
                optionId: 27,
                allowed: true,
                requiresClientSelection: false,
              },
            ],
          });

        try {
          await assert.rejects(
            () =>
              getAnalyticsPowerBiOptionAccess(
                [27, 29]
              ),
            /incompleta/
          );
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),

    test(
      'obtiene autorización cartera y publicación del viewer en una sola solicitud',
      async () => {
        const originalFetch = globalThis.fetch;
        let requestCount = 0;
        let requestedUrl = '';

        globalThis.fetch = async (input) => {
          requestCount++;
          requestedUrl = String(input);

          return Response.json({
            optionId: 27,
            allowed: true,
            requiresClientSelection: true,
            clientSelectionStatus: 'VALID',
            selectedClient: {
              clientId: 8,
              name: ' DIRECTV ',
            },
            embedUrl:
              ' https://app.powerbi.com/view?r=abc123 ',
          });
        };

        try {
          const result =
            await getAnalyticsPowerBiViewerContext(
              27,
              {
                clientId: 8,
                name: ' DIRECTV ',
              }
            );

          assert.equal(requestCount, 1);
          assert.match(
            requestedUrl,
            /\/api\/v1\/analytics-access\/user\/options\/27\/power-bi-viewer-context\?clientId=8&reportClient=DIRECTV$/
          );
          assert.deepEqual(result, {
            optionId: 27,
            allowed: true,
            requiresClientSelection: true,
            clientSelectionStatus: 'VALID',
            selectedClient: {
              clientId: 8,
              name: 'DIRECTV',
            },
            embedUrl:
              'https://app.powerbi.com/view?r=abc123',
          });
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),

    test(
      'rechaza un contexto viewer inconsistente antes de renderizar el iframe',
      async () => {
        const originalFetch = globalThis.fetch;

        globalThis.fetch = async () =>
          Response.json({
            optionId: 27,
            allowed: true,
            requiresClientSelection: true,
            clientSelectionStatus: 'VALID',
            selectedClient: null,
            embedUrl: null,
          });

        try {
          await assert.rejects(
            () =>
              getAnalyticsPowerBiViewerContext(
                27,
                {
                  clientId: 8,
                  name: 'DIRECTV',
                }
              ),
            /inconsistente/
          );
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
  ]
);
