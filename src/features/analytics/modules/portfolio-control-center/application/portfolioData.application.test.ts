import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import {
  DEFAULT_PORTFOLIO_CONTROL_CENTER_FILTERS,
} from '../constants/portfolioControlCenter.constants';
import {
  loadPortfolioControlCenter,
  loadPortfolioControlCenterBootstrap,
} from './portfolioOverview.application';
import {
  loadPortfolioAdvisorPerformance,
  loadPortfolioSupervisorPerformance,
} from './portfolioPerformance.application';

const jsonResponse = (body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });

const responseFor = (url: string): Response => {
  if (url.includes('/bootstrap')) {
    const requestUrl = new URL(url, 'http://localhost');
    const requestedBusinessUnit =
      requestUrl.searchParams.get('businessUnit') ??
      'CLARO ADMINISTRATIVO';
    const requestedCampaign =
      requestUrl.searchParams.get('campaign');
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

  if (url.includes('/overview')) {
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

  if (url.includes('/supervisor-performance')) {
    return jsonResponse({
      dateFrom: '2026-08-01',
      dateTo: '2026-08-13',
      updatedAt: null,
      supervisors: [],
    });
  }

  if (url.includes('/advisor-performance')) {
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
          const result = await loadPortfolioControlCenterBootstrap(
            95,
            DEFAULT_PORTFOLIO_CONTROL_CENTER_FILTERS,
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
        assert.match(requests[0] ?? '', /\/bootstrap(?:\?|$)/);
        assert.equal(
          requests.some((url) => url.includes('/filter-options')),
          false
        );
        assert.equal(
          requests.some((url) => url.includes('/overview')),
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
            await loadPortfolioControlCenterBootstrap(
              95,
              {
                ...DEFAULT_PORTFOLIO_CONTROL_CENTER_FILTERS,
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
          /\/bootstrap\?/
        );
        assert.match(
          requests[0]?.url ?? '',
          /(?:\?|&)businessUnit=CLARO\+GOBIERNO(?:&|$)/
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
            await loadPortfolioControlCenterBootstrap(
              95,
              {
                ...DEFAULT_PORTFOLIO_CONTROL_CENTER_FILTERS,
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
          /businessUnit=CLARO\+GOBIERNO/
        );
        assert.doesNotMatch(
          requests[0] ?? '',
          /(?:\?|&)campaign=/
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
          const result = await loadPortfolioControlCenter(
            95,
            DEFAULT_PORTFOLIO_CONTROL_CENTER_FILTERS,
            controller.signal
          );

          assert.equal(result.context.campaignId, '2026-08');
          assert.equal(result.summary.assignedPortfolio, 100);
        } finally {
          globalThis.fetch = originalFetch;
        }

        assert.equal(requests.length, 1);
        assert.match(requests[0] ?? '', /\/overview(?:\?|$)/);

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
          await loadPortfolioControlCenter(
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

        assert.equal(
          requests[0],
          '/analytics-api/api/v1/portfolio-control-center/overview?campaign=2026-08&businessUnit=CLARO+GOBIERNO&dateFrom=2026-08-05&dateTo=2026-08-13&subPortfolioId=29&crmClientId=95'
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

          await loadPortfolioSupervisorPerformance(
            95,
            context,
            controller.signal
          );

          assert.equal(requests.length, 1);
          assert.match(
            requests[0]?.url ?? '',
            /\/supervisor-performance\?/
          );
          assert.match(
            requests[0]?.url ?? '',
            /(?:\?|&)businessUnit=CLARO\+GOBIERNO(?:&|$)/
          );
          assert.match(
            requests[0]?.url ?? '',
            /(?:\?|&)crmClientId=95(?:&|$)/
          );
          assert.equal(
            requests[0]?.signal,
            controller.signal
          );

          requests.length = 0;

          await loadPortfolioAdvisorPerformance(
            95,
            context,
            '1',
            controller.signal
          );

          assert.equal(requests.length, 1);
          assert.match(
            requests[0]?.url ?? '',
            /\/advisor-performance\?/
          );
          assert.match(
            requests[0]?.url ?? '',
            /(?:\?|&)supervisorId=1(?:&|$)/
          );
          assert.match(
            requests[0]?.url ?? '',
            /(?:\?|&)businessUnit=CLARO\+GOBIERNO(?:&|$)/
          );
          assert.match(
            requests[0]?.url ?? '',
            /(?:\?|&)crmClientId=95(?:&|$)/
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
