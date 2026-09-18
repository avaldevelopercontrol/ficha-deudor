import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import {
  DEFAULT_CENTRO_CONTROL_CARTERA_FILTERS,
} from '../constants/centroControlCartera.constants';
import {
  loadCentroControlCartera,
  loadCentroControlCarteraBootstrap,
} from './panoramaCartera.application';
import {
  loadRendimientoAsesorCartera,
  loadRendimientoSupervisorCartera,
} from './rendimientoCartera.application';

const jsonResponse = (body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });

const responseFor = (url: string): Response => {
  if (url.includes('/Inicializacion')) {
    const requestUrl = new URL(url, 'http://localhost');
    const requestedBusinessUnit =
      requestUrl.searchParams.get('unidadNegocio') ??
      'CLARO ADMINISTRATIVO';
    const requestedCampaign =
      requestUrl.searchParams.get('campana');
    const currentCampaignUnavailable =
      requestedBusinessUnit === 'CLARO GOBIERNO' &&
      requestedCampaign === null;

    return jsonResponse({
      filterOptions: {
        availableDateFrom: '2026-08-01',
        availableDateTo: '2026-08-13',
        updatedAt: null,
        portfolio: { id: 95 },
        businessUnits: [
          { code: 'CLARO ADMINISTRATIVO', name: 'CLARO ADMINISTRATIVO' },
          { code: 'CLARO GOBIERNO', name: 'CLARO GOBIERNO' },
        ],
        selectedBusinessUnit: requestedBusinessUnit,
        campaigns: [
          {
            code: '2026-08',
            name: 'Agosto 2026',
            startDate: '2026-08-01',
            endDate: '2026-08-31',
            availableDateFrom: '2026-08-01',
            availableDateTo: '2026-08-13',
          },
        ],
        subPortfolios: [],
        supervisors: [],
        availability: {
          subPortfolioCampaigns: [],
          supervisorContexts: [],
        },
      },
      overview: currentCampaignUnavailable
        ? null
        : {
        summary: {
          campaign: {
            code: '2026-08',
            name: 'Agosto 2026',
          },
          period: {
            dateFrom: '2026-08-01',
            dateTo: '2026-08-13',
            snapshotDate: '2026-08-12',
          },
          updatedAt: '2026-08-14T16:00:00Z',
          freshness: {
            operationAsOfAt: null,
            portfolioBaseRefreshedAt: null,
            refreshedAt: null,
          },
          summary: {
            assignedPortfolio: 100,
            managedPortfolio: 80,
            pendingPortfolio: 20,
            managementCount: 10,
            managementIntensity: null,
            recoveredAmount: 25,
            contactabilityRate: 50,
            rpcRate: 40,
            closeRate: 10,
            promiseCount: 2,
            promiseFulfillmentRate: null,
            paymentCount: 1,
          },
        },
        targetProgress: {
          campaign: { code: '2026-08', name: 'Agosto 2026' },
          period: { dateTo: '2026-08-13', asOfDate: '2026-08-13' },
          updatedAt: null,
          target: null,
        },
        promises: {
          campaign: { code: '2026-08', name: 'Agosto 2026' },
          updatedAt: null,
          promises: {
            dueTodayCount: 0,
            dueTodayAmount: 0,
            overdueCount: 0,
            fulfillmentRate: null,
          },
        },
        evolution: {
          campaign: { code: '2026-08', name: 'Agosto 2026' },
          period: { dateFrom: '2026-08-01', dateTo: '2026-08-13' },
          updatedAt: null,
          evolution: [],
        },
      },
    });
  }

  if (url.includes('/Panorama')) {
    return jsonResponse({
      summary: {
        campaign: {
          code: '2026-08',
          name: 'Agosto 2026',
        },
        period: {
          dateFrom: '2026-08-01',
          dateTo: '2026-08-13',
          snapshotDate: '2026-08-12',
        },
        updatedAt: '2026-08-14T16:00:00Z',
        freshness: {
          operationAsOfAt: null,
          portfolioBaseRefreshedAt: null,
          refreshedAt: null,
        },
        summary: {
          assignedPortfolio: 100,
          managedPortfolio: 80,
          pendingPortfolio: 20,
          managementCount: 10,
          managementIntensity: null,
          recoveredAmount: 25,
          contactabilityRate: 50,
          rpcRate: 40,
          closeRate: 10,
          promiseCount: 2,
          promiseFulfillmentRate: null,
          paymentCount: 1,
        },
      },
      targetProgress: {
        campaign: { code: '2026-08', name: 'Agosto 2026' },
        period: {
          dateTo: '2026-08-13',
          asOfDate: '2026-08-13',
        },
        updatedAt: null,
        target: null,
      },
      promises: {
        campaign: { code: '2026-08', name: 'Agosto 2026' },
        updatedAt: null,
        promises: {
          dueTodayCount: 0,
          dueTodayAmount: 0,
          overdueCount: 0,
          fulfillmentRate: null,
        },
      },
      evolution: {
        campaign: { code: '2026-08', name: 'Agosto 2026' },
        period: {
          dateFrom: '2026-08-01',
          dateTo: '2026-08-13',
        },
        updatedAt: null,
        evolution: [],
      },
    });
  }

  if (url.includes('/RendimientoSupervisor')) {
    return jsonResponse({
      dateFrom: '2026-08-01',
      dateTo: '2026-08-13',
      updatedAt: null,
      supervisors: [],
    });
  }

  if (url.includes('/RendimientoAsesor')) {
    return jsonResponse({
      dateFrom: '2026-08-01',
      dateTo: '2026-08-13',
      updatedAt: null,
      advisors: [],
    });
  }

  throw new Error(`Request inesperada en baseline: ${url}`);
};

export const suite = defineSuite(
  'portfolio application data loading',
  [
    test(
      'carga filtros y overview iniciales con un unico request Bootstrap',
      async () => {
        const originalFetch = globalThis.fetch;
        const requests: string[] = [];

        globalThis.fetch = async (input) => {
          const url = String(input);
          requests.push(url);
          return responseFor(url);
        };

        try {
          const result = await loadCentroControlCarteraBootstrap(
            95,
            DEFAULT_CENTRO_CONTROL_CARTERA_FILTERS,
            new AbortController().signal
          );

          assert.ok(result.data);
          assert.equal(result.data.context.campaignId, '2026-08');
          assert.equal(
            result.data.context.businessUnit,
            'CLARO ADMINISTRATIVO'
          );
          assert.equal(result.filterOptions.portfolio?.id, '95');
          assert.equal(result.filterOptions.campaigns.length, 1);
        } finally {
          globalThis.fetch = originalFetch;
        }

        assert.equal(requests.length, 1);
        assert.match(requests[0] ?? '', /\/Inicializacion(?:\?|$)/);
        assert.equal(
          requests.some((url) => url.includes('/filter-options')),
          false
        );
        assert.equal(
          requests.some((url) => url.includes('/Panorama')),
          false
        );
      }
    ),
    test(
      'Bootstrap Gobierno conserva el scope resuelto y target no disponible en una sola solicitud',
      async () => {
        const originalFetch = globalThis.fetch;
        const requests: Array<{
          url: string;
          signal: AbortSignal | null;
        }> = [];
        const controller = new AbortController();

        globalThis.fetch = async (input, init) => {
          const url = String(input);
          requests.push({
            url,
            signal: init?.signal ?? null,
          });
          return responseFor(url);
        };

        try {
          const result =
            await loadCentroControlCarteraBootstrap(
              95,
              {
                ...DEFAULT_CENTRO_CONTROL_CARTERA_FILTERS,
                businessUnit: 'CLARO GOBIERNO',
                campaignId: '2026-08',
              },
              controller.signal
            );

          assert.equal(
            result.filterOptions.selectedBusinessUnit,
            'CLARO GOBIERNO'
          );
          assert.ok(result.data);
          assert.equal(
            result.data.context.businessUnit,
            'CLARO GOBIERNO'
          );
          assert.equal(result.data.target, null);
        } finally {
          globalThis.fetch = originalFetch;
        }

        assert.equal(requests.length, 1);
        assert.match(
          requests[0]?.url ?? '',
          /\/Inicializacion\?/
        );
        assert.match(
          requests[0]?.url ?? '',
          /(?:\?|&)unidadNegocio=CLARO\+GOBIERNO(?:&|$)/
        );
        assert.equal(
          requests[0]?.signal,
          controller.signal
        );
      }
    ),
    test(
      'Bootstrap Gobierno sin campaña actual conserva filtros y no cae a la última campaña histórica',
      async () => {
        const originalFetch = globalThis.fetch;
        const requests: string[] = [];

        globalThis.fetch = async (input) => {
          const url = String(input);
          requests.push(url);
          return responseFor(url);
        };

        try {
          const result =
            await loadCentroControlCarteraBootstrap(
              95,
              {
                ...DEFAULT_CENTRO_CONTROL_CARTERA_FILTERS,
                businessUnit: 'CLARO GOBIERNO',
              },
              new AbortController().signal
            );

          assert.equal(result.data, null);
          assert.equal(
            result.filterOptions.selectedBusinessUnit,
            'CLARO GOBIERNO'
          );
          assert.equal(
            result.filterOptions.campaigns[0]?.id,
            '2026-08'
          );
        } finally {
          globalThis.fetch = originalFetch;
        }

        assert.equal(requests.length, 1);
        assert.match(
          requests[0] ?? '',
          /unidadNegocio=CLARO\+GOBIERNO/
        );
        assert.doesNotMatch(
          requests[0] ?? '',
          /(?:\?|&)campana=/
        );
      }
    ),
    test(
      'mantiene los cambios de filtros en un unico request Overview despues del bootstrap',
      async () => {
        const originalFetch = globalThis.fetch;
        const requests: string[] = [];

        globalThis.fetch = async (input) => {
          const url = String(input);
          requests.push(url);
          return responseFor(url);
        };

        try {
          const controller = new AbortController();
          const result = await loadCentroControlCartera(
            95,
            DEFAULT_CENTRO_CONTROL_CARTERA_FILTERS,
            controller.signal
          );

          assert.equal(result.context.campaignId, '2026-08');
          assert.equal(result.summary.assignedPortfolio, 100);
        } finally {
          globalThis.fetch = originalFetch;
        }

        assert.equal(requests.length, 1);
        assert.match(requests[0] ?? '', /\/Panorama(?:\?|$)/);

        for (const endpoint of [
          'summary',
          'target-progress',
          'promises',
          'evolution',
          'campaign-performance',
          'supervisor-performance',
          'advisor-performance',
        ]) {
          assert.equal(
            requests.some((url) =>
              url.includes(`/${endpoint}`)
            ),
            false,
            `${endpoint} no debe formar parte del bootstrap`
          );
        }
      }
    ),
    test(
      'envia filtros canonicos directamente a Overview sin reconstruir contexto en React',
      async () => {
        const originalFetch = globalThis.fetch;
        const requests: string[] = [];

        globalThis.fetch = async (input) => {
          const url = String(input);
          requests.push(url);
          return responseFor(url);
        };

        try {
          await loadCentroControlCartera(
            95,
            {
              businessUnit: 'CLARO GOBIERNO',
              dateFrom: '2026-08-05',
              dateTo: '2026-08-13',
              subPortfolioId: '29',
              campaignId: '2026-08',
              supervisorId: null,
            },
            new AbortController().signal
          );
        } finally {
          globalThis.fetch = originalFetch;
        }

        const requestUrl = new URL(
          requests[0] ?? '',
          'http://localhost'
        );

        assert.equal(
          `${requestUrl.pathname.replace(
            /^\/analytics-api(?=\/)/,
            ''
          )}${requestUrl.search}`,
          '/v1/Analitica/CentroControlCartera/Panorama?campana=2026-08&unidadNegocio=CLARO+GOBIERNO&fechaDesde=2026-08-05&fechaHasta=2026-08-13&idSubCartera=29&idClienteCrm=95'
        );
      }
    ),
    test(
      'cada detalle operativo ejecuta solo su endpoint y propaga CRM y AbortSignal',
      async () => {
        const originalFetch = globalThis.fetch;
        const requests: Array<{
          url: string;
          signal: AbortSignal | null;
        }> = [];
        const controller = new AbortController();

        globalThis.fetch = async (input, init) => {
          const url = String(input);
          requests.push({
            url,
            signal: init?.signal ?? null,
          });
          return responseFor(url);
        };

        try {
          const context = {
            businessUnit: 'CLARO GOBIERNO',
            campaignId: '2026-08',
            dateFrom: '2026-08-01',
            dateTo: '2026-08-13',
            subPortfolioId: '29',
          } as const;

          await loadRendimientoSupervisorCartera(
            95,
            context,
            controller.signal
          );

          assert.equal(requests.length, 1);
          assert.match(
            requests[0]?.url ?? '',
            /\/RendimientoSupervisor\?/
          );
          assert.match(
            requests[0]?.url ?? '',
            /(?:\?|&)unidadNegocio=CLARO\+GOBIERNO(?:&|$)/
          );
          assert.match(
            requests[0]?.url ?? '',
            /(?:\?|&)idClienteCrm=95(?:&|$)/
          );
          assert.equal(
            requests[0]?.signal,
            controller.signal
          );

          requests.length = 0;

          await loadRendimientoAsesorCartera(
            95,
            context,
            '1',
            controller.signal
          );

          assert.equal(requests.length, 1);
          assert.match(
            requests[0]?.url ?? '',
            /\/RendimientoAsesor\?/
          );
          assert.match(
            requests[0]?.url ?? '',
            /(?:\?|&)idSupervisor=1(?:&|$)/
          );
          assert.match(
            requests[0]?.url ?? '',
            /(?:\?|&)unidadNegocio=CLARO\+GOBIERNO(?:&|$)/
          );
          assert.match(
            requests[0]?.url ?? '',
            /(?:\?|&)idClienteCrm=95(?:&|$)/
          );
          assert.equal(
            requests[0]?.signal,
            controller.signal
          );
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
  ]
);
