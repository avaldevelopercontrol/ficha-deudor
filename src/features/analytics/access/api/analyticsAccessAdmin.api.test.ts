import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../test/testHarness';

import {
  getAnalyticsPowerBiConfiguration,
  syncAnalyticsPowerBiConfiguration,
} from './analyticsAccessAdmin.api';

export const suite = defineSuite(
  'analyticsAccessAdmin.api',
  [
    test(
      'carga grupos y publicaciones con una sola solicitud agregada',
      async () => {
        const originalFetch = globalThis.fetch;
        let requestCount = 0;
        let capturedMethod = '';

        globalThis.fetch = async (
          _input,
          init
        ) => {
          requestCount++;
          capturedMethod = init?.method ?? '';

          return Response.json({
            optionId: 27,
            isConfigured: true,
            groupIds: [156, 156],
            availableGroups: [
              {
                groupId: 156,
                clientId: 95,
                name: ' CLIENTE GENERAL ',
              },
            ],
            clients: [
              {
                clientId: 178,
                name: ' ADEX INSTITUTO ',
                isAvailable: true,
                groupResolution: 'AUTO_DETECTED',
                hasExplicitGroupConfiguration: false,
                groupIds: [219],
                candidateGroups: [
                  {
                    groupId: 219,
                    name: ' ADEX INSTITUTO [219] ',
                  },
                ],
                embedUrl:
                  ' https://app.powerbi.com/view?r=test ',
                isReady: true,
              },
            ],
          });
        };

        try {
          const result =
            await getAnalyticsPowerBiConfiguration(27);

          assert.equal(requestCount, 1);
          assert.equal(capturedMethod, 'GET');
          assert.deepEqual(result.groupIds, [156]);
          assert.deepEqual(result.availableGroups, [
            {
              groupId: 156,
              clientId: 95,
              name: 'CLIENTE GENERAL',
            },
          ]);
          assert.equal(
            result.clients[0]?.groupResolution,
            'AUTO_DETECTED'
          );
          assert.deepEqual(
            result.clients[0]?.groupIds,
            [219]
          );
          assert.equal(
            result.clients[0]?.embedUrl,
            'https://app.powerbi.com/view?r=test'
          );
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
    test(
      'rechaza grupos malformados en vez de omitirlos silenciosamente',
      async () => {
        const originalFetch = globalThis.fetch;

        globalThis.fetch = async () =>
          Response.json({
            optionId: 27,
            isConfigured: true,
            groupIds: [156],
            availableGroups: [
              {
                groupId: 0,
                clientId: 95,
                name: 'Inválido',
              },
            ],
            clients: [],
          });

        try {
          await assert.rejects(
            () => getAnalyticsPowerBiConfiguration(27),
            /response\.availableGroups\[0\]\.groupId debe ser un entero positivo/
          );
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
    test(
      'rechaza publicaciones con resolución de grupo fuera del contrato',
      async () => {
        const originalFetch = globalThis.fetch;

        globalThis.fetch = async () =>
          Response.json({
            optionId: 27,
            isConfigured: true,
            groupIds: [156],
            availableGroups: [],
            clients: [
              {
                clientId: 178,
                name: 'ADEX',
                isAvailable: true,
                groupResolution: 'UNKNOWN',
                hasExplicitGroupConfiguration: false,
                groupIds: [],
                candidateGroups: [],
                embedUrl: null,
                isReady: false,
              },
            ],
          });

        try {
          await assert.rejects(
            () => getAnalyticsPowerBiConfiguration(27),
            /response\.clients\[0\]\.groupResolution debe ser uno de/
          );
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
    test(
      'rechaza una publicación cuyo groupId no pertenece a candidateGroups',
      async () => {
        const originalFetch = globalThis.fetch;

        globalThis.fetch = async () =>
          Response.json({
            optionId: 27,
            isConfigured: true,
            groupIds: [156],
            availableGroups: [],
            clients: [
              {
                clientId: 178,
                name: 'ADEX',
                isAvailable: true,
                groupResolution: 'CONFIGURED',
                hasExplicitGroupConfiguration: true,
                groupIds: [219],
                candidateGroups: [
                  { groupId: 220, name: 'Otro grupo' },
                ],
                embedUrl: null,
                isReady: false,
              },
            ],
          });

        try {
          await assert.rejects(
            () => getAnalyticsPowerBiConfiguration(27),
            /groupIds contiene un grupo no disponible/
          );
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
    test(
      'rechaza flags de configuración mal tipados',
      async () => {
        const originalFetch = globalThis.fetch;

        globalThis.fetch = async () =>
          Response.json({
            optionId: 27,
            isConfigured: 'true',
            groupIds: [],
            availableGroups: [],
            clients: [],
          });

        try {
          await assert.rejects(
            () => getAnalyticsPowerBiConfiguration(27),
            /response\.isConfigured debe ser un booleano/
          );
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
    test(
      'guarda opción grupo y publicaciones en una sola solicitud PATCH',
      async () => {
        const originalFetch = globalThis.fetch;
        let requestCount = 0;
        let capturedMethod = '';
        let capturedBody: unknown = null;

        globalThis.fetch = async (
          _input,
          init
        ) => {
          requestCount++;
          capturedMethod = init?.method ?? '';
          capturedBody = JSON.parse(String(init?.body));

          return new Response(null, {
            status: 204,
          });
        };

        try {
          await syncAnalyticsPowerBiConfiguration({
            optionId: 27,
            optionCode:
              ' GESTION_INTEGRAL_COBRANZA ',
            optionName:
              ' Gestión Integral de Cobranza ',
            isActive: true,
            groupIds: [156, 156],
            publications: [
              {
                clientId: 178,
                name: ' ADEX INSTITUTO ',
                groupIds: null,
                embedUrl:
                  ' https://app.powerbi.com/view?r=test ',
              },
            ],
          });

          assert.equal(requestCount, 1);
          assert.equal(capturedMethod, 'PATCH');
          assert.deepEqual(capturedBody, {
            optionCode:
              'GESTION_INTEGRAL_COBRANZA',
            optionName:
              'Gestión Integral de Cobranza',
            isActive: true,
            groupIds: [156],
            publications: [
              {
                clientId: 178,
                name: 'ADEX INSTITUTO',
                groupIds: null,
                embedUrl:
                  'https://app.powerbi.com/view?r=test',
              },
            ],
          });
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
    test(
      'rechaza optionId y metadatos vacíos antes de ejecutar HTTP',
      async () => {
        const originalFetch = globalThis.fetch;
        let requestCount = 0;

        globalThis.fetch = async () => {
          requestCount += 1;
          throw new Error('No debe ejecutarse HTTP');
        };

        try {
          await assert.rejects(
            () => getAnalyticsPowerBiConfiguration(0),
            /optionId debe ser un entero positivo/
          );

          await assert.rejects(
            () =>
              syncAnalyticsPowerBiConfiguration({
                optionId: 27,
                optionCode: '   ',
                optionName: 'Reporte',
                isActive: true,
                groupIds: [156],
              }),
            /optionCode no puede estar vacío/
          );

          assert.equal(requestCount, 0);
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
    test(
      'rechaza publicaciones inválidas antes de ejecutar el PATCH',
      async () => {
        const originalFetch = globalThis.fetch;
        let requestCount = 0;

        globalThis.fetch = async () => {
          requestCount += 1;
          throw new Error('No debe ejecutarse HTTP');
        };

        const baseInput = {
          optionId: 27,
          optionCode: 'REPORTE',
          optionName: 'Reporte',
          isActive: true,
          groupIds: [156],
        } as const;

        try {
          await assert.rejects(
            () =>
              syncAnalyticsPowerBiConfiguration({
                ...baseInput,
                publications: [
                  {
                    clientId: 0,
                    name: 'ADEX',
                    groupIds: null,
                    embedUrl:
                      'https://app.powerbi.com/view?r=test',
                  },
                ],
              }),
            /publications\[0\]\.clientId debe ser un entero positivo/
          );

          await assert.rejects(
            () =>
              syncAnalyticsPowerBiConfiguration({
                ...baseInput,
                publications: [
                  {
                    clientId: 178,
                    name: '   ',
                    groupIds: null,
                    embedUrl:
                      'https://app.powerbi.com/view?r=test',
                  },
                ],
              }),
            /publications\[0\]\.name no puede estar vacío/
          );

          await assert.rejects(
            () =>
              syncAnalyticsPowerBiConfiguration({
                ...baseInput,
                publications: [
                  {
                    clientId: 178,
                    name: 'ADEX',
                    groupIds: null,
                    embedUrl: 'javascript:alert(1)',
                  },
                ],
              }),
            /embedUrl debe ser una URL pública válida de Power BI/
          );

          await assert.rejects(
            () =>
              syncAnalyticsPowerBiConfiguration({
                ...baseInput,
                publications: [
                  {
                    clientId: 178,
                    name: 'ADEX',
                    groupIds: [0],
                    embedUrl:
                      'https://app.powerbi.com/view?r=test',
                  },
                ],
              }),
            /publications\[0\]\.groupIds debe ser un entero positivo/
          );

          assert.equal(requestCount, 0);
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
    test(
      'propaga AbortSignal al cargar la configuración administrativa',
      async () => {
        const originalFetch = globalThis.fetch;
        const controller = new AbortController();
        let receivedSignal: AbortSignal | null = null;

        globalThis.fetch = async (_input, init) => {
          receivedSignal = init?.signal ?? null;
          return Response.json({
            optionId: 27,
            isConfigured: false,
            groupIds: [],
            availableGroups: [],
            clients: [],
          });
        };

        try {
          await getAnalyticsPowerBiConfiguration(
            27,
            controller.signal
          );
          assert.equal(receivedSignal, controller.signal);
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
  ]
);
