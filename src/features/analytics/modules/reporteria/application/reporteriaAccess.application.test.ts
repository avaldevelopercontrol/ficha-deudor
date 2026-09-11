import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import type {
  PowerBiReport,
  ReporteriaCatalog,
} from '../domain/reporteria.types';
import {
  loadReporteriaReportAccess,
} from './reporteriaCatalog.application';
import {
  resolvePowerBiReportOpen,
} from './reporteriaNavigation.application';
import {
  loadPowerBiViewerAccess,
  resolvePowerBiViewerEmbedState,
  resolvePowerBiViewerReport,
} from './reporteriaViewer.application';

const buildReport = (
  id: number,
  serviceUrl = 'https://app.powerbi.com/view?r=base'
): PowerBiReport => ({
  id,
  code: `REPORT_${id}`,
  name: `Reporte ${id}`,
  description: '',
  serviceUrl,
  image: null,
  email: null,
  icon: 'analytics',
});

const reports = [
  buildReport(26),
  buildReport(27),
  buildReport(28),
];

const catalog: ReporteriaCatalog = {
  section: {
    id: 20,
    name: 'Reportería',
    description: '',
    parentId: 1,
  },
  parentName: 'Analytics',
  reports,
};

export const suite = defineSuite(
  'reporteria application',
  [
    test(
      'resume acceso batch en reportes permitidos y reportes con selección de cartera',
      async () => {
        let receivedIds: readonly number[] = [];

        const result =
          await loadReporteriaReportAccess(
            reports,
            undefined,
            {
              getPowerBiOptionAccess: async (
                optionIds
              ) => {
                receivedIds = optionIds;

                return [
                  {
                    optionId: 26,
                    allowed: true,
                    requiresClientSelection: false,
                  },
                  {
                    optionId: 27,
                    allowed: true,
                    requiresClientSelection: true,
                  },
                  {
                    optionId: 28,
                    allowed: false,
                    requiresClientSelection: true,
                  },
                ];
              },
            }
          );

        assert.deepEqual(receivedIds, [26, 27, 28]);
        assert.deepEqual(
          result.allowedReportIds,
          [26, 27]
        );
        assert.deepEqual(
          result.clientScopedReportIds,
          [27]
        );
      }
    ),
    test(
      'reporte sin selección de cartera navega directamente sin consultar clientes',
      async () => {
        let requestCount = 0;

        const result =
          await resolvePowerBiReportOpen(
            reports[0],
            false,
            undefined,
            {
              getReportClients: async () => {
                requestCount++;
                return [];
              },
            }
          );

        assert.equal(requestCount, 0);
        assert.deepEqual(result, {
          kind: 'navigate',
          route: '/analytics/reporteria/bi/26',
        });
      }
    ),
    test(
      'una sola cartera autorizada resuelve navegación directa con contexto',
      async () => {
        const result =
          await resolvePowerBiReportOpen(
            reports[0],
            true,
            undefined,
            {
              getReportClients: async () => [
                {
                  clientId: 95,
                  name: 'CLARO',
                },
              ],
            }
          );

        assert.equal(result.kind, 'navigate');

        if (result.kind === 'navigate') {
          assert.match(
            result.route,
            /clientId=95/
          );
          assert.match(
            result.route,
            /reportClient=CLARO/
          );
        }
      }
    ),
    test(
      'varias carteras mantienen la selección como decisión de presentación',
      async () => {
        const clients = [
          { clientId: 95, name: 'CLARO' },
          { clientId: 120, name: 'ADEX' },
        ];

        const result =
          await resolvePowerBiReportOpen(
            reports[0],
            true,
            undefined,
            {
              getReportClients: async () => clients,
            }
          );

        assert.deepEqual(result, {
          kind: 'client-selection',
          clients,
        });
      }
    ),
    test(
      'viewer resuelve reporte solo para un optionId positivo autorizado por el catálogo',
      () => {
        assert.deepEqual(
          resolvePowerBiViewerReport(
            catalog,
            '27'
          ),
          {
            optionId: 27,
            report: reports[1],
          }
        );

        assert.equal(
          resolvePowerBiViewerReport(
            catalog,
            '999'
          ).report,
          null
        );
        assert.equal(
          resolvePowerBiViewerReport(
            catalog,
            'invalid'
          ).report,
          null
        );
      }
    ),
    test(
      'viewer convierte query string a selección de cartera antes de consultar Analytics',
      async () => {
        let receivedClient: unknown = undefined;

        const result =
          await loadPowerBiViewerAccess(
            27,
            'clientId=95&reportClient=CLARO',
            undefined,
            {
              getViewerContext: async (
                optionId,
                client
              ) => {
                assert.equal(optionId, 27);
                receivedClient = client;

                return {
                  optionId,
                  allowed: true,
                  requiresClientSelection: true,
                  clientSelectionStatus: 'VALID',
                  selectedClient: client,
                  embedUrl:
                    'https://app.powerbi.com/view?r=scoped',
                };
              },
            }
          );

        assert.deepEqual(receivedClient, {
          clientId: 95,
          name: 'CLARO',
        });
        assert.equal(result.allowed, true);
        assert.equal(
          result.clientSelectionStatus,
          'VALID'
        );
      }
    ),
    test(
      'viewer usa URL base cuando no existe contexto de cartera',
      () => {
        assert.deepEqual(
          resolvePowerBiViewerEmbedState(
            reports[0],
            {
              allowed: true,
              clientSelectionStatus:
                'NOT_REQUIRED',
              selectedClient: null,
              scopedEmbedUrl: null,
            }
          ),
          {
            baseEmbedUrl:
              'https://app.powerbi.com/view?r=base',
            requiresScopedEmbed: false,
            rawScopedEmbedUrl: null,
            embedUrl:
              'https://app.powerbi.com/view?r=base',
          }
        );
      }
    ),
    test(
      'viewer prioriza publicación de cartera y conserva URL raw inválida para el mensaje específico',
      () => {
        const state =
          resolvePowerBiViewerEmbedState(
            reports[0],
            {
              allowed: true,
              clientSelectionStatus: 'VALID',
              selectedClient: {
                clientId: 95,
                name: 'CLARO',
              },
              scopedEmbedUrl:
                'https://example.com/no-power-bi',
            }
          );

        assert.equal(
          state.requiresScopedEmbed,
          true
        );
        assert.equal(
          state.rawScopedEmbedUrl,
          'https://example.com/no-power-bi'
        );
        assert.equal(state.embedUrl, null);
      }
    ),
  ]
);
