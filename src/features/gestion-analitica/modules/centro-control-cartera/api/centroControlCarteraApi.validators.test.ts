import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import {
  fetchCentroControlCarteraOverview,
} from './centroControlCarteraApi';
import type {
  RendimientoAsesorCarteraApiResponse,
  RendimientoSupervisorCarteraApiResponse,
} from './centroControlCarteraApi.types';
import {
  parseRendimientoAsesorCarteraApiResponse,
  parseInicializacionCarteraApiResponse,
  parsePromesasCarteraVenceHoyApiResponse,
  parsePromesasCarteraVencidasApiResponse,
  parseRendimientoSupervisorCarteraApiResponse,
  parseSeguimientoPromesasCarteraApiResponse,
  CentroControlCarteraContractError,
} from './centroControlCarteraApi.validators';

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
      error instanceof CentroControlCarteraContractError &&
      error.path === expectedPath
  );
};

export const suite = defineSuite(
  'centroControlCarteraApi runtime contracts',
  [
    test(
      'acepta un Bootstrap valido y conserva campos adicionales compatibles',
      () => {
        const response = {
          ...createBootstrap(),
          futureField: 'compatible',
        };

        const result = parseInicializacionCarteraApiResponse(response);

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
          parseInicializacionCarteraApiResponse(response),
          response
        );
      }
    ),
    test(
      'valida Business Units y exige que la seleccion pertenezca al catalogo',
      () => {
        const response = createBootstrap();

        assert.equal(
          parseInicializacionCarteraApiResponse(response),
          response
        );

        response.filterOptions.selectedBusinessUnit = 'OTRA UNIDAD';
        assertContractError(
          () => parseInicializacionCarteraApiResponse(response),
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
          () => parseInicializacionCarteraApiResponse(invalidId),
          '$.portfolio.id'
        );

        const invalidDate = createBootstrap();
        invalidDate.filterOptions.campaigns[0]!.availableDateTo =
          '2026-02-31';
        assertContractError(
          () => parseInicializacionCarteraApiResponse(invalidDate),
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
          () => parseInicializacionCarteraApiResponse(response),
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
          () => parseInicializacionCarteraApiResponse(response),
          '$.evolution'
        );
      }
    ),
    test(
      'valida ids opcionales y metricas de Supervisor y Advisor Performance',
      () => {
        const supervisors: RendimientoSupervisorCarteraApiResponse = {
          dateFrom: '2026-08-01',
          dateTo: '2026-08-13',
          updatedAt: null,
          supervisors: [
            {
              supervisorId: 1,
              supervisorName: 'Supervisor',
              advisorCount: 1,
              managementCount: 10,
              managedDebtorCount: 6,
              rpcRate: null,
              closeRate: 20,
              promiseCount: 2,
              promiseFulfillmentRate: null,
              paymentCount: 1,
              attributableRecoveredAmount: 25,
            },
          ],
        };
        const advisors: RendimientoAsesorCarteraApiResponse = {
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
              managedDebtorCount: 6,
              rpcRate: 40,
              closeRate: null,
              promiseCount: 2,
              paymentCount: 1,
              attributableRecoveredAmount: 25,
            },
          ],
        };

        assert.equal(
          parseRendimientoSupervisorCarteraApiResponse(supervisors),
          supervisors
        );
        assert.equal(
          parseRendimientoAsesorCarteraApiResponse(advisors),
          advisors
        );

        supervisors.supervisors[0]!.managedDebtorCount = null;
        assert.equal(
          parseRendimientoSupervisorCarteraApiResponse(supervisors),
          supervisors
        );
        supervisors.supervisors[0]!.managedDebtorCount = 6;

        advisors.advisors[0]!.managedDebtorCount = null;
        assert.equal(
          parseRendimientoAsesorCarteraApiResponse(advisors),
          advisors
        );
        advisors.advisors[0]!.managedDebtorCount = 6;

        advisors.advisors[0]!.advisorId = 0;
        assertContractError(
          () => parseRendimientoAsesorCarteraApiResponse(advisors),
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
          () => parsePromesasCarteraVencidasApiResponse(response),
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
          parsePromesasCarteraVenceHoyApiResponse(response),
          response
        );

        const item = response.items[0] as Record<string, unknown>;
        item.statusKey = 'unknown';
        assertContractError(
          () => parsePromesasCarteraVenceHoyApiResponse(response),
          '$.items[0].statusKey'
        );

        item.statusKey = 'pending';
        const pagination = response.pagination as Record<string, unknown>;
        pagination.hasNextPage = 1;
        assertContractError(
          () => parsePromesasCarteraVenceHoyApiResponse(response),
          '$.pagination.hasNextPage'
        );
      }
    ),
    test(
      'valida seguimiento operativo con contacto, llamadas y confirmación nullable',
      () => {
        const response = {
          campaign: { code: '2026-09', name: 'Septiembre 2026' },
          dueDate: '2026-09-14',
          asOfDate: '2026-09-14',
          updatedAt: '2026-09-14T16:20:20.176Z',
          summary: {
            promiseCount: 1,
            promiseAmount: 184.99,
            paidAmount: 0,
            outstandingAmount: 184.99,
          },
          status: [
            {
              key: 'pending',
              label: 'Pendiente',
              count: 1,
              promiseAmount: 184.99,
              paidAmount: 0,
              outstandingAmount: 184.99,
            },
          ],
          pagination: {
            page: 1,
            pageSize: 5,
            totalItems: 1,
            totalPages: 1,
            hasPreviousPage: false,
            hasNextPage: false,
          },
          items: [
            {
              promiseId: 4951,
              debtorId: 18330126,
              debtorName: 'INVERSIONES METCON SAC',
              dueDate: '2026-09-14',
              promiseAmount: 184.99,
              paidAmount: 0,
              outstandingAmount: 184.99,
              lastPaymentDate: null,
              statusKey: 'pending',
              managed: true,
              managementCount: 2,
              callCount: 2,
              contactKey: 'direct',
              contactLabel: 'Contacto directo',
              paymentConfirmed: null,
              lastManagementAt: '2026-09-14T09:03:10.913',
              advisorId: 8,
              advisorName: 'MIGUEL SOLANGE JHAMILE',
              supervisorId: null,
              supervisorName: null,
            },
          ],
        };

        assert.equal(
          parseSeguimientoPromesasCarteraApiResponse(response),
          response
        );

        const item = response.items[0] as Record<string, unknown>;
        item.paymentConfirmed = 'yes';
        assertContractError(
          () => parseSeguimientoPromesasCarteraApiResponse(response),
          '$.items[0].paymentConfirmed'
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
            fetchCentroControlCarteraOverview(
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
              error instanceof CentroControlCarteraContractError &&
              error.path === '$.summary.managedPortfolio'
          );
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
  ]
);
