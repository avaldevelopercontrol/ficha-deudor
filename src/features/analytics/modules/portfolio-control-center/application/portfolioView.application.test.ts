import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import type {
  PortfolioControlCenterFilterOptions,
  PortfolioControlCenterFilters,
} from '../domain/portfolioFilters.types';
import type {
  PortfolioControlCenterData,
} from '../domain/portfolioOverview.types';
import { resolvePortfolioControlCenterViewState } from './portfolioView.application';

const FILTERS: PortfolioControlCenterFilters = {
  businessUnit: 'GOB',
  dateFrom: null,
  dateTo: null,
  subPortfolioId: null,
  campaignId: null,
  supervisorId: null,
};

const FILTER_OPTIONS: PortfolioControlCenterFilterOptions = {
  availableDateFrom: null,
  availableDateTo: null,
  portfolio: null,
  businessUnits: [],
  selectedBusinessUnit: 'ADMIN',
  subPortfolios: [],
  campaigns: [],
  supervisors: [],
  availability: {
    subPortfolioCampaigns: [],
    supervisorContexts: [],
  },
};

const DATA = {
  context: {
    businessUnit: 'ADMIN',
    campaignId: '2026-08',
    dateFrom: '2026-08-01',
    dateTo: '2026-08-13',
    subPortfolioId: null,
  },
} as PortfolioControlCenterData;

export const suite = defineSuite(
  'portfolioView.application',
  [
    test('oculta datos anteriores mientras la cartera solicitada todavía no fue confirmada', () => {
      const result = resolvePortfolioControlCenterViewState({
        filters: FILTERS,
        filterOptions: FILTER_OPTIONS,
        data: DATA,
        isLoading: false,
        error: null,
      });

      assert.equal(result.isBusinessUnitTransitionPending, true);
      assert.equal(result.visibleData, null);
      assert.equal(result.visibleIsLoading, true);
      assert.equal(result.effectiveBusinessUnit, 'GOB');
    }),
    test('expone datos cuando el backend confirma la cartera solicitada', () => {
      const data = {
        ...DATA,
        context: {
          ...DATA.context,
          businessUnit: 'GOB',
        },
      } as PortfolioControlCenterData;

      const result = resolvePortfolioControlCenterViewState({
        filters: FILTERS,
        filterOptions: {
          ...FILTER_OPTIONS,
          selectedBusinessUnit: 'GOB',
        },
        data,
        isLoading: false,
        error: null,
      });

      assert.equal(result.isBusinessUnitTransitionPending, false);
      assert.equal(result.visibleData, data);
      assert.equal(result.visibleIsLoading, false);
      assert.equal(result.clearBusinessUnit, 'GOB');
    }),
  ]
);
