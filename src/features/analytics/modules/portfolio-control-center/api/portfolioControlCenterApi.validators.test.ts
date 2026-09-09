import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import {
  fetchPortfolioControlCenterOverview,
} from './portfolioControlCenterApi';
import {
  parsePortfolioAdvisorPerformanceApiResponse,
  parsePortfolioBootstrapApiResponse,
  parsePortfolioDueTodayPromisesApiResponse,
  parsePortfolioOverduePromisesApiResponse,
  parsePortfolioSupervisorPerformanceApiResponse,
  PortfolioControlCenterContractError,
} from './portfolioControlCenterApi.validators';

const createSummary = () => ({
  campaign: { code: '2026-08', name: 'Agosto 2026' },
  period: {
    dateFrom: '2026-08-01',
    dateTo: '2026-08-13',
    snapshotDate: '2026-08-13',
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
});

const createOverview = () => ({
  summary: createSummary(),
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
    evolution: [
      {
        period: '2026-08-13',
        assignedPortfolio: 100,
        managedPortfolio: 80,
        pendingPortfolio: 20,
        recoveredAmount: 25,
      },
    ],
  },
});

const createBootstrap = () => ({
  filterOptions: {
    availableDateFrom: '2026-08-01',
    availableDateTo: '2026-08-13',
    updatedAt: '2026-08-14T16:00:00Z',
    portfolio: { id: 95 },
    businessUnits: [
      { code: 'CLARO ADMINISTRATIVO', name: 'CLARO ADMINISTRATIVO' },
      { code: 'CLARO GOBIERNO', name: 'CLARO GOBIERNO' },
    ],
    selectedBusinessUnit: 'CLARO GOBIERNO',
    campaigns: [
      {
        code: '2026-08',
        name: 'Agosto 2026',
        year: 2026,
        month: 8,
        startDate: '2026-08-01',
        endDate: '2026-08-31',
        availableDateFrom: '2026-08-01',
        availableDateTo: '2026-08-13',
      },
    ],
    subPortfolios: [{ id: 29, name: 'Subcartera' }],
    supervisors: [{ id: 1, name: 'Supervisor' }],
    availability: {
      subPortfolioCampaigns: [
        {
          subPortfolioId: 29,
          campaignCode: '2026-08',
          availableDateFrom: '2026-08-01',
          availableDateTo: '2026-08-13',
        },
      ],
      supervisorContexts: [
        {
          supervisorId: 1,
          subPortfolioId: 29,
          campaignCode: '2026-08',
          availableDateFrom: '2026-08-01',
          availableDateTo: '2026-08-13',
        },
      ],
    },
  },
  overview: createOverview(),
});

const assertContractError = (
  run: () => unknown,
  expectedPath: string
): void => {
  assert.throws(
    run,
    (error: unknown) =>
      error instanceof PortfolioControlCenterContractError &&
      error.path === expectedPath
  );
};

export const suite = defineSuite(
  'portfolioControlCenterApi runtime contracts',
  [
    test(
      'acepta un Bootstrap valido y conserva campos adicionales compatibles',
      () => {
        const response = {
          ...createBootstrap(),
          futureField: 'compatible',
        };

        const result = parsePortfolioBootstrapApiResponse(response);

        assert.equal(result, response);
      }
    ),
    test(
      'acepta Bootstrap sin overview cuando la campaña operativa actual aún no está disponible',
      () => {
        const response = {
          ...createBootstrap(),
          overview: null,
        };

        assert.equal(
          parsePortfolioBootstrapApiResponse(response),
          response
        );
      }
    ),
    test(
      'valida Business Units y exige que la seleccion pertenezca al catalogo',
      () => {
        const response = createBootstrap();

        assert.equal(
          parsePortfolioBootstrapApiResponse(response),
          response
        );

        response.filterOptions.selectedBusinessUnit = 'OTRA UNIDAD';
        assertContractError(
          () => parsePortfolioBootstrapApiResponse(response),
          '$.selectedBusinessUnit'
        );
      }
    ),
    test(
      'rechaza ids y fechas invalidas antes de que Filter Options llegue al mapper',
      () => {
        const invalidId = createBootstrap();
        invalidId.filterOptions.portfolio.id = 0;
        assertContractError(
          () => parsePortfolioBootstrapApiResponse(invalidId),
          '$.portfolio.id'
        );

        const invalidDate = createBootstrap();
        invalidDate.filterOptions.campaigns[0]!.availableDateTo =
          '2026-02-31';
        assertContractError(
          () => parsePortfolioBootstrapApiResponse(invalidDate),
          '$.campaigns[0].availableDateTo'
        );
      }
    ),
    test(
      'rechaza numeros serializados como string en las metricas del Overview',
      () => {
        const response = createBootstrap();
        const summary = response.overview.summary.summary as Record<
          string,
          unknown
        >;
        summary.assignedPortfolio = '100';

        assertContractError(
          () => parsePortfolioBootstrapApiResponse(response),
          '$.summary.assignedPortfolio'
        );
      }
    ),
    test(
      'rechaza arrays estructurales nulos en Evolution',
      () => {
        const response = createBootstrap();
        const evolution = response.overview.evolution as Record<
          string,
          unknown
        >;
        evolution.evolution = null;

        assertContractError(
          () => parsePortfolioBootstrapApiResponse(response),
          '$.evolution'
        );
      }
    ),
    test(
      'valida ids opcionales y metricas de Supervisor y Advisor Performance',
      () => {
        const supervisors = {
          dateFrom: '2026-08-01',
          dateTo: '2026-08-13',
          updatedAt: null,
          supervisors: [
            {
              supervisorId: 1,
              supervisorName: 'Supervisor',
              advisorCount: 1,
              managementCount: 10,
              rpcRate: null,
              closeRate: 20,
              promiseCount: 2,
              promiseFulfillmentRate: null,
              paymentCount: 1,
              attributableRecoveredAmount: 25,
            },
          ],
        };
        const advisors = {
          dateFrom: '2026-08-01',
          dateTo: '2026-08-13',
          updatedAt: null,
          advisors: [
            {
              advisorId: 3,
              advisorName: 'Asesor',
              periodSupervisorId: 1,
              periodSupervisorName: 'Supervisor del período',
              currentSupervisorId: null,
              currentSupervisorName: null,
              managementCount: 10,
              rpcRate: 40,
              closeRate: null,
              promiseCount: 2,
              paymentCount: 1,
              attributableRecoveredAmount: 25,
            },
          ],
        };

        assert.equal(
          parsePortfolioSupervisorPerformanceApiResponse(supervisors),
          supervisors
        );
        assert.equal(
          parsePortfolioAdvisorPerformanceApiResponse(advisors),
          advisors
        );

        advisors.advisors[0]!.advisorId = 0;
        assertContractError(
          () => parsePortfolioAdvisorPerformanceApiResponse(advisors),
          '$.advisors[0].advisorId'
        );
      }
    ),
    test(
      'rechaza aging keys fuera del contrato en promesas vencidas',
      () => {
        const response = {
          campaign: { code: '2026-08', name: 'Agosto 2026' },
          asOfDate: '2026-08-14',
          updatedAt: null,
          summary: {
            overdueCount: 1,
            overdueAmount: 100,
            outstandingAmount: 100,
          },
          aging: [
            {
              key: 'unexpected',
              label: 'Otro',
              count: 1,
              promiseAmount: 100,
              outstandingAmount: 100,
            },
          ],
          filters: {
            advisors: [],
            supervisors: [],
          },
          items: [],
        };

        assertContractError(
          () => parsePortfolioOverduePromisesApiResponse(response),
          '$.aging[0].key'
        );
      }
    ),
    test(
      'rechaza status keys y paginacion inconsistentes en promesas que vencen hoy',
      () => {
        const response = {
          campaign: { code: '2026-08', name: 'Agosto 2026' },
          asOfDate: '2026-08-14',
          updatedAt: null,
          summary: {
            dueTodayCount: 1,
            dueTodayAmount: 100,
            paidAmount: 0,
            outstandingAmount: 100,
          },
          status: [
            {
              key: 'pending',
              label: 'Pendiente',
              count: 1,
              promiseAmount: 100,
              paidAmount: 0,
              outstandingAmount: 100,
            },
          ],
          pagination: {
            page: 1,
            pageSize: 25,
            totalItems: 1,
            totalPages: 1,
            hasPreviousPage: false,
            hasNextPage: false,
          },
          items: [
            {
              promiseId: 10,
              debtorId: 20,
              promiseAmount: 100,
              paidAmount: 0,
              outstandingAmount: 100,
              lastPaymentDate: null,
              statusKey: 'pending',
              advisorId: null,
              advisorName: null,
              supervisorId: null,
              supervisorName: null,
            },
          ],
        };

        assert.equal(
          parsePortfolioDueTodayPromisesApiResponse(response),
          response
        );

        const item = response.items[0] as Record<string, unknown>;
        item.statusKey = 'unknown';
        assertContractError(
          () => parsePortfolioDueTodayPromisesApiResponse(response),
          '$.items[0].statusKey'
        );

        item.statusKey = 'pending';
        const pagination = response.pagination as Record<string, unknown>;
        pagination.hasNextPage = 1;
        assertContractError(
          () => parsePortfolioDueTodayPromisesApiResponse(response),
          '$.pagination.hasNextPage'
        );
      }
    ),
    test(
      'el fetch HTTP entra como unknown y rechaza un Overview invalido antes del service',
      async () => {
        const originalFetch = globalThis.fetch;
        const response = createOverview();
        const summary = response.summary.summary as Record<string, unknown>;
        summary.managedPortfolio = null;

        globalThis.fetch = async () =>
          new Response(JSON.stringify(response), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          });

        try {
          await assert.rejects(
            fetchPortfolioControlCenterOverview(
              95,
              {
                businessUnit: null,
                campaignId: '2026-08',
                dateFrom: '2026-08-01',
                dateTo: '2026-08-13',
                subPortfolioId: null,
                supervisorId: null,
              },
              new AbortController().signal
            ),
            (error: unknown) =>
              error instanceof PortfolioControlCenterContractError &&
              error.path === '$.summary.managedPortfolio'
          );
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
  ]
);
