import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import type {
  AdvisorPerformanceItem,
  CampaignPerformanceItem,
  SupervisorPerformanceItem,
} from '../../../types/portfolioControlCenter.types';
import {
  PORTFOLIO_DETAIL_SORT_OPTIONS,
  sortAdvisorPerformanceByHighest,
  sortCampaignPerformanceByHighest,
  sortSupervisorPerformanceByHighest,
} from './portfolioDetailSort.utils';

const advisors: AdvisorPerformanceItem[] = [
  {
    advisorId: '1',
    advisorName: 'A',
    currentSupervisorId: null,
    currentSupervisorName: null,
    managementCount: 10,
    rpcRate: 80,
    closeRate: 20,
    promiseCount: 2,
    paymentCount: 1,
    attributableRecoveredAmount: 100,
  },
  {
    advisorId: '2',
    advisorName: 'B',
    currentSupervisorId: null,
    currentSupervisorName: null,
    managementCount: 20,
    rpcRate: 70,
    closeRate: 30,
    promiseCount: 3,
    paymentCount: 2,
    attributableRecoveredAmount: 200,
  },
];

const supervisors: SupervisorPerformanceItem[] = [
  {
    supervisorId: '1',
    supervisorName: 'A',
    advisorCount: 2,
    managementCount: 100,
    rpcRate: 90,
    closeRate: 10,
    promiseCount: 4,
    promiseFulfillmentRate: 50,
    paymentCount: 2,
    attributableRecoveredAmount: 100,
  },
  {
    supervisorId: '2',
    supervisorName: 'B',
    advisorCount: 5,
    managementCount: 80,
    rpcRate: 70,
    closeRate: 20,
    promiseCount: 6,
    promiseFulfillmentRate: 60,
    paymentCount: 3,
    attributableRecoveredAmount: 200,
  },
];

const campaigns: CampaignPerformanceItem[] = [
  {
    campaignId: '1',
    campaignName: 'A',
    assignedPortfolio: 100,
    managedPortfolio: 50,
    progressRate: 50,
    managementCount: 50,
    contactabilityRate: 70,
    rpcRate: 60,
    closeRate: 10,
    promiseCount: 4,
    promiseFulfillmentRate: 50,
    paymentCount: 2,
    recoveredAmount: 100,
    targetAmount: 500,
  },
  {
    campaignId: '2',
    campaignName: 'B',
    assignedPortfolio: 100,
    managedPortfolio: 25,
    progressRate: 25,
    managementCount: 50,
    contactabilityRate: 80,
    rpcRate: 70,
    closeRate: 20,
    promiseCount: 6,
    promiseFulfillmentRate: 60,
    paymentCount: 3,
    recoveredAmount: 200,
    targetAmount: 600,
  },
];

export const suite = defineSuite(
  'portfolioDetailSort.utils',
  [
    test('expone exactamente 6, 8 y 12 métricas ordenables por vista', () => {
      assert.equal(PORTFOLIO_DETAIL_SORT_OPTIONS.advisors.length, 6);
      assert.equal(PORTFOLIO_DETAIL_SORT_OPTIONS.supervisors.length, 8);
      assert.equal(PORTFOLIO_DETAIL_SORT_OPTIONS.campaigns.length, 12);
    }),
    test('ordena asesores y supervisores de mayor a menor', () => {
      assert.deepEqual(
        sortAdvisorPerformanceByHighest(advisors, 'managementCount').map(
          (item) => item.advisorId
        ),
        ['2', '1']
      );
      assert.deepEqual(
        sortSupervisorPerformanceByHighest(supervisors, 'advisorCount').map(
          (item) => item.supervisorId
        ),
        ['2', '1']
      );
    }),
    test('ordena intensidad de campaña con la misma razón mostrada en la tabla', () => {
      assert.deepEqual(
        sortCampaignPerformanceByHighest(campaigns, 'managementIntensity').map(
          (item) => item.campaignId
        ),
        ['2', '1']
      );
    }),
    test('conserva el orden original cuando no se selecciona una métrica', () => {
      assert.deepEqual(
        sortAdvisorPerformanceByHighest(advisors, '').map(
          (item) => item.advisorId
        ),
        ['1', '2']
      );
    }),
  ]
);
