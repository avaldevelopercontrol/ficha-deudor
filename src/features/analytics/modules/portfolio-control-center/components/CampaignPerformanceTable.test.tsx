import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import type {
  CampaignPerformanceItem,
} from '../../../types/portfolioControlCenter.types';
import {
  CampaignPerformanceTable,
} from './CampaignPerformanceTable';

const GOVERNMENT_CAMPAIGN: CampaignPerformanceItem = {
  campaignId: '2026-08',
  campaignName: 'Agosto 2026',
  assignedPortfolio: 100,
  managedPortfolio: 80,
  progressRate: 80,
  managementCount: 120,
  contactabilityRate: 50,
  rpcRate: 40,
  closeRate: 10,
  promiseCount: 5,
  promiseFulfillmentRate: 60,
  paymentCount: 4,
  recoveredAmount: 1_200,
  targetAmount: null,
};

export const suite = defineSuite(
  'CampaignPerformanceTable',
  [
    test(
      'muestra Meta no disponible cuando Analytics no tiene target para la cartera',
      () => {
        const html = renderToStaticMarkup(
          <CampaignPerformanceTable
            items={[GOVERNMENT_CAMPAIGN]}
          />
        );

        assert.match(html, /Meta/);
        assert.match(html, /No disponible/);
        assert.doesNotMatch(html, />S\/\s*0(?:[.,]00)?</);
      }
    ),
  ]
);
