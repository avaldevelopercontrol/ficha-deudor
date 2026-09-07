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
            groupIds: [156, 156, -1],
            availableGroups: [
              {
                groupId: 156,
                clientId: 95,
                name: ' CLIENTE GENERAL ',
              },
              {
                groupId: 0,
                clientId: 95,
                name: 'inválido',
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
            await getAnalyticsPowerBiConfiguration(
              27
            );

          assert.equal(requestCount, 1);
          assert.equal(capturedMethod, 'GET');
          assert.deepEqual(
            result.groupIds,
            [156]
          );
          assert.deepEqual(
            result.availableGroups,
            [
              {
                groupId: 156,
                clientId: 95,
                name: 'CLIENTE GENERAL',
              },
            ]
          );
          assert.equal(
            result.clients[0]?.groupResolution,
            'AUTO_DETECTED'
          );
          assert.deepEqual(
            result.clients[0]?.groupIds,
            [219]
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
          capturedBody = JSON.parse(
            String(init?.body)
          );

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
          assert.deepEqual(
            capturedBody,
            {
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
            }
          );
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
  ]
);
