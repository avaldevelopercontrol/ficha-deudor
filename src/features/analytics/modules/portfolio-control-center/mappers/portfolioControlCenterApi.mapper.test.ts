import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import type {
  PortfolioAdvisorPerformanceApiResponse,
  PortfolioEvolutionApiResponse,
  PortfolioFilterOptionsApiResponse,
  PortfolioPromisesApiResponse,
  PortfolioOverduePromisesApiResponse,
  PortfolioOverviewApiResponse,
  PortfolioDueTodayPromisesApiResponse,
  PortfolioSummaryApiResponse,
  PortfolioSupervisorPerformanceApiResponse,
  PortfolioTargetProgressApiResponse,
} from '../api/portfolioControlCenterApi.types';
import {
  mapPortfolioAdvisorPerformanceResponse,
  mapPortfolioEvolutionResponse,
  mapPortfolioFilterOptionsResponse,
  mapPortfolioOperationalResponses,
  mapPortfolioOverviewResponse,
  mapPortfolioOverduePromisesResponse,
  mapPortfolioDueTodayPromisesResponse,
  mapPortfolioSupervisorPerformanceResponse,
} from './portfolioControlCenterApi.mapper';

const FILTER_OPTIONS_RESPONSE: PortfolioFilterOptionsApiResponse = {
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
  subPortfolios: [
    {
      id: 29,
      name: 'Subcartera real',
    },
  ],
  supervisors: [
    {
      id: 1,
      name: 'Supervisor real',
    },
  ],
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
        availableDateFrom: '2026-08-05',
        availableDateTo: '2026-08-13',
      },
    ],
  },
};

const SUMMARY_RESPONSE: PortfolioSummaryApiResponse = {
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
    operationAsOfAt: '2026-08-14T10:47:00-05:00',
    portfolioBaseRefreshedAt: '2026-08-14T11:30:00Z',
    refreshedAt: '2026-08-14T15:55:00Z',
  },
  summary: {
    assignedPortfolio: 42904,
    managedPortfolio: 37938,
    pendingPortfolio: 4966,
    managementCount: 3817,
    managementIntensity: null,
    recoveredAmount: 2667904.8986,
    contactabilityRate: 70.25,
    rpcRate: 91.1504,
    closeRate: 7.767,
    promiseCount: 231,
    promiseFulfillmentRate: null,
    paymentCount: 3510,
  },
};

const TARGET_RESPONSE: PortfolioTargetProgressApiResponse = {
  campaign: {
    code: '2026-08',
    name: 'Agosto 2026',
  },
  period: {
    dateTo: '2026-08-13',
    asOfDate: '2026-08-13',
  },
  updatedAt: '2026-08-14T16:05:00Z',
  target: {
    monthlyTargetAmount: 17140742,
    expectedToDateAmount: 7713333.9,
    targetAchievementRate: 15.5646,
    paceAchievementRate: 34.5882,
    gapAmount: -5045429.0014,
    gapRate: -65.4118,
  },
};

const PROMISES_RESPONSE: PortfolioPromisesApiResponse = {
  campaign: {
    code: '2026-08',
    name: 'Agosto 2026',
  },
  updatedAt: '2026-08-14T16:04:30Z',
  promises: {
    dueTodayCount: 7,
    dueTodayAmount: 14500,
    overdueCount: 3,
    fulfillmentRate: null,
  },
};

const OVERDUE_PROMISES_RESPONSE: PortfolioOverduePromisesApiResponse = {
  campaign: {
    code: '2026-08',
    name: 'Agosto 2026',
  },
  asOfDate: '2026-08-14',
  updatedAt: '2026-08-14T16:10:00Z',
  summary: {
    overdueCount: 46,
    overdueAmount: 184530,
    outstandingAmount: 151420,
  },
  aging: [
    {
      key: '1-3',
      label: '1 - 3 días',
      count: 24,
      promiseAmount: 90000,
      outstandingAmount: 80000,
    },
    {
      key: '4-7',
      label: '4 - 7 días',
      count: 14,
      promiseAmount: 54530,
      outstandingAmount: 41420,
    },
    {
      key: '8-plus',
      label: '8+ días',
      count: 8,
      promiseAmount: 40000,
      outstandingAmount: 30000,
    },
  ],
  filters: {
    advisors: [{ id: 3, name: 'AMAR SONIA IVET' }],
    supervisors: [
      { id: 1, name: 'POMACARHUA ALCANTARA YANINA' },
    ],
  },
  items: [
    {
      promiseId: 991,
      debtorId: 16068,
      dueDate: '2026-08-08',
      overdueDays: 6,
      promiseAmount: 5000,
      paidAmount: 500,
      outstandingAmount: 4500,
      agingKey: '4-7',
      advisorId: 3,
      advisorName: 'AMAR SONIA IVET',
      supervisorId: 1,
      supervisorName: 'POMACARHUA ALCANTARA YANINA',
    },
  ],
};

const DUE_TODAY_PROMISES_RESPONSE: PortfolioDueTodayPromisesApiResponse = {
  campaign: {
    code: '2026-08',
    name: 'Agosto 2026',
  },
  asOfDate: '2026-08-18',
  updatedAt: '2026-08-18T15:00:00Z',
  summary: {
    dueTodayCount: 4,
    dueTodayAmount: 283.68,
    paidAmount: 83.68,
    outstandingAmount: 200,
  },
  status: [
    {
      key: 'pending',
      label: 'Pendiente',
      count: 2,
      promiseAmount: 200,
      paidAmount: 0,
      outstandingAmount: 200,
    },
    {
      key: 'partial',
      label: 'Pago parcial',
      count: 1,
      promiseAmount: 33.68,
      paidAmount: 16.84,
      outstandingAmount: 16.84,
    },
    {
      key: 'covered',
      label: 'Cubierta',
      count: 1,
      promiseAmount: 50,
      paidAmount: 50,
      outstandingAmount: 0,
    },
  ],
  items: [
    {
      promiseId: 992,
      debtorId: 17000,
      promiseAmount: 100,
      paidAmount: 25,
      outstandingAmount: 75,
      lastPaymentDate: '2026-08-18',
      statusKey: 'partial',
      advisorId: 3,
      advisorName: 'AMAR SONIA IVET',
      supervisorId: null,
      supervisorName: null,
    },
  ],
};

const EVOLUTION_RESPONSE: PortfolioEvolutionApiResponse = {
  campaign: {
    code: '2026-08',
    name: 'Agosto 2026',
  },
  period: {
    dateFrom: '2026-08-01',
    dateTo: '2026-08-13',
  },
  updatedAt: '2026-08-14T16:06:00Z',
  evolution: [
    {
      period: '2026-08-12',
      assignedPortfolio: 42904,
      managedPortfolio: 37695,
      pendingPortfolio: 5209,
      recoveredAmount: 2598564.3256,
    },
    {
      period: '2026-08-13',
      assignedPortfolio: 42904,
      managedPortfolio: 37938,
      pendingPortfolio: 4966,
      recoveredAmount: 2667904.8986,
    },
  ],
};

const OVERVIEW_RESPONSE: PortfolioOverviewApiResponse = {
  summary: SUMMARY_RESPONSE,
  targetProgress: TARGET_RESPONSE,
  promises: PROMISES_RESPONSE,
  evolution: EVOLUTION_RESPONSE,
};

const SUPERVISOR_PERFORMANCE_RESPONSE: PortfolioSupervisorPerformanceApiResponse = {
  dateFrom: '2026-08-05',
  dateTo: '2026-08-13',
  updatedAt: '2026-08-14T16:08:00Z',
  supervisors: [
    {
      supervisorId: 1,
      supervisorName: 'POMACARHUA ALCANTARA YANINA',
      advisorCount: 5,
      managementCount: 242,
      rpcRate: 91.1504,
      closeRate: 7.767,
      promiseCount: 8,
      promiseFulfillmentRate: null,
      paymentCount: 0,
      attributableRecoveredAmount: 0,
    },
  ],
};


const ADVISOR_PERFORMANCE_RESPONSE: PortfolioAdvisorPerformanceApiResponse = {
  dateFrom: '2026-08-05',
  dateTo: '2026-08-13',
  updatedAt: '2026-08-14T16:09:00Z',
  advisors: [
    {
      advisorId: 3,
      advisorName: 'AMAR SONIA IVET',
      periodSupervisorId: 1,
      periodSupervisorName:
        'POMACARHUA ALCANTARA YANINA',
      currentSupervisorId: 1,
      currentSupervisorName:
        'POMACARHUA ALCANTARA YANINA',
      managementCount: 279,
      rpcRate: 93.5484,
      closeRate: 5.7471,
      promiseCount: 5,
      paymentCount: 3,
      attributableRecoveredAmount: 103211.41,
    },
    {
      advisorId: 4,
      advisorName: 'ASESOR SIN SUPERVISOR ACTUAL',
      periodSupervisorId: 7,
      periodSupervisorName: 'SUPERVISORA DEL PERIODO',
      currentSupervisorId: null,
      currentSupervisorName: null,
      managementCount: 17,
      rpcRate: null,
      closeRate: null,
      promiseCount: 0,
      paymentCount: 1,
      attributableRecoveredAmount: 1250,
    },
  ],
};

export const suite = defineSuite(
  'portfolioControlCenterApi.mapper',
  [
    test(
      'normaliza ids y relaciones many-to-many de Filter Options',
      () => {
        const result = mapPortfolioFilterOptionsResponse(
          FILTER_OPTIONS_RESPONSE
        );

        assert.deepEqual(result.businessUnits, [
          { id: 'CLARO ADMINISTRATIVO', label: 'CLARO ADMINISTRATIVO' },
          { id: 'CLARO GOBIERNO', label: 'CLARO GOBIERNO' },
        ]);
        assert.equal(result.selectedBusinessUnit, 'CLARO GOBIERNO');
        assert.deepEqual(result.subPortfolios[0], {
          id: '29',
          label: 'Subcartera real',
        });
        assert.equal(result.campaigns[0]?.id, '2026-08');
        assert.equal(result.campaigns[0]?.year, 2026);
        assert.equal(result.campaigns[0]?.month, 8);
        assert.deepEqual(
          result.availability.supervisorContexts[0],
          {
            supervisorId: '1',
            subPortfolioId: '29',
            campaignId: '2026-08',
            availableDateFrom: '2026-08-05',
            availableDateTo: '2026-08-13',
          }
        );
      }
    ),
    test(
      'mantiene compatibilidad con Filter Options previo sin year/month',
      () => {
        const legacyResponse: PortfolioFilterOptionsApiResponse = {
          ...FILTER_OPTIONS_RESPONSE,
          businessUnits: undefined,
          selectedBusinessUnit: undefined,
          campaigns: FILTER_OPTIONS_RESPONSE.campaigns.map(
            (campaign) => ({
              code: campaign.code,
              name: campaign.name,
              startDate: campaign.startDate,
              endDate: campaign.endDate,
              availableDateFrom: campaign.availableDateFrom,
              availableDateTo: campaign.availableDateTo,
            })
          ),
        };

        const result = mapPortfolioFilterOptionsResponse(
          legacyResponse
        );

        assert.equal(result.campaigns[0]?.year, 2026);
        assert.equal(result.campaigns[0]?.month, 8);
        assert.deepEqual(result.businessUnits, []);
        assert.equal(result.selectedBusinessUnit, null);
      }
    ),
    test(
      'mapea el dataset completo de promesas vencidas sin perder antigüedad ni atribución',
      () => {
        const result = mapPortfolioOverduePromisesResponse(
          OVERDUE_PROMISES_RESPONSE
        );

        assert.equal(result.summary.overdueCount, 46);
        assert.equal(result.aging[2]?.key, '8-plus');
        assert.equal(result.items[0]?.debtorId, '16068');
        assert.equal(result.items[0]?.agingKey, '4-7');
        assert.equal(result.items[0]?.advisorId, '3');
        assert.equal(result.filters.supervisors[0]?.id, '1');
      }
    ),
    test(
      'mapea el dataset completo de promesas con vencimiento hoy y su estado de cumplimiento',
      () => {
        const result = mapPortfolioDueTodayPromisesResponse(
          DUE_TODAY_PROMISES_RESPONSE
        );

        assert.equal(result.summary.dueTodayCount, 4);
        assert.equal(result.summary.outstandingAmount, 200);
        assert.equal(result.status[1]?.key, 'partial');
        assert.equal(result.items[0]?.debtorId, '17000');
        assert.equal(result.items[0]?.statusLabel, 'Pago parcial');
        assert.equal(result.items[0]?.lastPaymentDate, '2026-08-18');
        assert.equal(result.items[0]?.advisorId, '3');
        assert.equal(result.items[0]?.supervisorId, null);
      }
    ),
    test(
      'mapea la serie Evolution sin recalcular acumulados en React',
      () => {
        const result = mapPortfolioEvolutionResponse(
          EVOLUTION_RESPONSE
        );

        assert.deepEqual(result, EVOLUTION_RESPONSE.evolution);
      }
    ),
    test(
      'mapea Supervisor Performance sin exponer métricas no atribuibles',
      () => {
        const result =
          mapPortfolioSupervisorPerformanceResponse(
            SUPERVISOR_PERFORMANCE_RESPONSE
          );

        assert.deepEqual(result[0], {
          supervisorId: '1',
          supervisorName: 'POMACARHUA ALCANTARA YANINA',
          advisorCount: 5,
          managementCount: 242,
          rpcRate: 91.1504,
          closeRate: 7.767,
          promiseCount: 8,
          promiseFulfillmentRate: null,
          paymentCount: 0,
          attributableRecoveredAmount: 0,
        });
        assert.equal(
          'contactabilityRate' in (result[0] ?? {}),
          false
        );
        assert.equal(
          'assignedPortfolio' in (result[0] ?? {}),
          false
        );
      }
    ),
    test(
      'mapea Advisor Performance sin contactabilidad y preserva supervisor actual nullable',
      () => {
        const result =
          mapPortfolioAdvisorPerformanceResponse(
            ADVISOR_PERFORMANCE_RESPONSE
          );

        assert.deepEqual(result[0], {
          advisorId: '3',
          advisorName: 'AMAR SONIA IVET',
          periodSupervisorId: '1',
          periodSupervisorName:
            'POMACARHUA ALCANTARA YANINA',
          currentSupervisorId: '1',
          currentSupervisorName:
            'POMACARHUA ALCANTARA YANINA',
          managementCount: 279,
          rpcRate: 93.5484,
          closeRate: 5.7471,
          promiseCount: 5,
          paymentCount: 3,
          attributableRecoveredAmount: 103211.41,
        });
        assert.equal(
          result[1]?.periodSupervisorId,
          '7'
        );
        assert.equal(
          result[1]?.periodSupervisorName,
          'SUPERVISORA DEL PERIODO'
        );
        assert.equal(
          result[1]?.currentSupervisorId,
          null
        );
        assert.equal(
          result[1]?.currentSupervisorName,
          null
        );
        assert.equal(
          'contactabilityRate' in (result[0] ?? {}),
          false
        );
        assert.equal(
          'recoveredAmount' in (result[0] ?? {}),
          false
        );
      }
    ),
    test(
      'mapea Overview usando exactamente la composicion operacional existente',
      () => {
        const aggregated = mapPortfolioOverviewResponse(
          OVERVIEW_RESPONSE,
          null
        );
        const legacyComposition = mapPortfolioOperationalResponses(
          SUMMARY_RESPONSE,
          TARGET_RESPONSE,
          PROMISES_RESPONSE,
          EVOLUTION_RESPONSE,
          null
        );

        assert.deepEqual(aggregated, legacyComposition);
      }
    ),
    test(
      'compone todos los bloques API en un unico modelo de dominio',
      () => {
        const result = mapPortfolioOperationalResponses(
          SUMMARY_RESPONSE,
          TARGET_RESPONSE,
          PROMISES_RESPONSE,
          EVOLUTION_RESPONSE,
          '29',
          'CLARO GOBIERNO'
        );

        assert.equal(
          result.target?.monthlyTargetAmount,
          17140742
        );
        assert.equal(result.target?.gapRate, -65.4118);
        assert.equal(result.promises.overdueCount, 3);
        assert.equal(
          result.promises.fulfillmentRate,
          null
        );
        assert.equal(
          result.updatedAt,
          '2026-08-14T16:06:00Z'
        );
        assert.deepEqual(result.freshness, {
          operationAsOfAt: '2026-08-14T10:47:00-05:00',
          portfolioBaseRefreshedAt: '2026-08-14T11:30:00Z',
          refreshedAt: '2026-08-14T15:55:00Z',
        });
        assert.deepEqual(result.context, {
          businessUnit: 'CLARO GOBIERNO',
          campaignId: '2026-08',
          dateFrom: '2026-08-01',
          dateTo: '2026-08-13',
          subPortfolioId: '29',
        });
        assert.deepEqual(
          result.attention.map((item) => item.metric),
          ['curveGap', 'promisesOverdue', 'promisesDue']
        );
        assert.equal(result.evolution.length, 2);
        assert.deepEqual(result.evolution[1], {
          period: '2026-08-13',
          assignedPortfolio: 42904,
          managedPortfolio: 37938,
          pendingPortfolio: 4966,
          recoveredAmount: 2667904.8986,
        });
        assert.equal(result.campaigns.length, 1);
        assert.equal(
          result.campaigns[0]?.campaignId,
          '2026-08'
        );
        assert.equal(
          result.campaigns[0]?.progressRate,
          88.4253
        );
        assert.equal(
          result.campaigns[0]?.targetAmount,
          null
        );
        assert.deepEqual(result.supervisors, []);
        assert.deepEqual(result.advisors, []);
        assert.equal(
          result.updatedAt,
          '2026-08-14T16:06:00Z'
        );
      }
    ),
    test(
      'deriva la fila de campaña seleccionada desde summary y target sin request adicional',
      () => {
        const result = mapPortfolioOperationalResponses(
          SUMMARY_RESPONSE,
          TARGET_RESPONSE,
          PROMISES_RESPONSE,
          EVOLUTION_RESPONSE,
          null
        );

        assert.equal(result.campaigns.length, 1);
        assert.deepEqual(result.campaigns[0], {
          campaignId: '2026-08',
          campaignName: 'Agosto 2026',
          assignedPortfolio: 42904,
          managedPortfolio: 37938,
          progressRate: 88.4253,
          managementCount: 3817,
          contactabilityRate: 70.25,
          rpcRate: 91.1504,
          closeRate: 7.767,
          promiseCount: 231,
          promiseFulfillmentRate: null,
          paymentCount: 3510,
          recoveredAmount: 2667904.8986,
          targetAmount: 17140742,
        });
      }
    ),
    test(
      'mantiene compatibilidad durante despliegue si Summary aún no expone freshness',
      () => {
        const result = mapPortfolioOperationalResponses(
          { ...SUMMARY_RESPONSE, freshness: undefined },
          TARGET_RESPONSE,
          PROMISES_RESPONSE,
          EVOLUTION_RESPONSE,
          null
        );

        assert.deepEqual(result.freshness, {
          operationAsOfAt: null,
          portfolioBaseRefreshedAt: null,
          refreshedAt: null,
        });
      }
    ),
    test(
      'preserva target null cuando Analytics no tiene meta configurada',
      () => {
        const result = mapPortfolioOperationalResponses(
          SUMMARY_RESPONSE,
          {
            ...TARGET_RESPONSE,
            target: null,
          },
          {
            ...PROMISES_RESPONSE,
            promises: {
              dueTodayCount: 0,
              dueTodayAmount: 0,
              overdueCount: 0,
              fulfillmentRate: null,
            },
          },
          EVOLUTION_RESPONSE,
          null
        );

        assert.equal(result.target, null);
        assert.deepEqual(result.attention, []);
      }
    ),
  ]
);
