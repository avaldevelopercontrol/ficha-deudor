import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import type {
  PortfolioOperationalContext,
} from '../domain/portfolioOverview.types';
import type {
  PortfolioControlCenterFilterOptions,
} from '../domain/portfolioFilters.types';
import {
  PORTFOLIO_UNASSIGNED_SUPERVISOR_FILTER_ID,
} from '../domain/portfolioFilterContext';
import {
  resolvePortfolioPerformanceSelection,
} from './portfolioPerformanceSelection.application';

const FILTER_OPTIONS: PortfolioControlCenterFilterOptions = {
  availableDateFrom: '2026-08-01',
  availableDateTo: '2026-08-31',
  portfolio: { id: '95' },
  businessUnits: [
    { id: 'CLARO GOBIERNO', label: 'CLARO GOBIERNO' },
  ],
  selectedBusinessUnit: 'CLARO GOBIERNO',
  subPortfolios: [
    { id: '20', label: 'Subcartera vigente' },
  ],
  campaigns: [],
  supervisors: [
    { id: '10', label: 'Supervisor vigente' },
    { id: '11', label: 'Supervisor otro contexto' },
  ],
  availability: {
    subPortfolioCampaigns: [],
    supervisorContexts: [
      {
        supervisorId: '10',
        subPortfolioId: '20',
        campaignId: '2026-08',
        availableDateFrom: '2026-08-01',
        availableDateTo: '2026-08-31',
      },
      {
        supervisorId: '11',
        subPortfolioId: '30',
        campaignId: '2026-08',
        availableDateFrom: '2026-08-01',
        availableDateTo: '2026-08-31',
      },
    ],
  },
};

const CONTEXT: PortfolioOperationalContext = {
  businessUnit: 'CLARO GOBIERNO',
  campaignId: '2026-08',
  dateFrom: '2026-08-01',
  dateTo: '2026-08-31',
  subPortfolioId: '20',
};

export const suite = defineSuite(
  'portfolioPerformanceSelection.application',
  [
    test(
      'mantiene como efectivo un supervisor disponible en el contexto',
      () => {
        const result = resolvePortfolioPerformanceSelection({
          filterOptions: FILTER_OPTIONS,
          context: CONTEXT,
          detailSupervisorId: '10',
          hasUnassignedAdvisors: false,
        });

        assert.equal(result.effectiveDetailSupervisorId, '10');
        assert.equal(result.detailSupervisorFilterValue, '10');
        assert.deepEqual(
          result.contextualSupervisorOptions.map((item) => item.id),
          ['10']
        );
      }
    ),
    test(
      'ignora una selección que no pertenece al contexto operativo actual',
      () => {
        const result = resolvePortfolioPerformanceSelection({
          filterOptions: FILTER_OPTIONS,
          context: CONTEXT,
          detailSupervisorId: '11',
          hasUnassignedAdvisors: false,
        });

        assert.equal(result.effectiveDetailSupervisorId, null);
        assert.equal(result.detailSupervisorFilterValue, null);
      }
    ),
    test(
      'habilita Sin supervisor sólo cuando existen asesores no asignados',
      () => {
        const withoutUnassigned =
          resolvePortfolioPerformanceSelection({
            filterOptions: FILTER_OPTIONS,
            context: CONTEXT,
            detailSupervisorId:
              PORTFOLIO_UNASSIGNED_SUPERVISOR_FILTER_ID,
            hasUnassignedAdvisors: false,
          });
        const withUnassigned =
          resolvePortfolioPerformanceSelection({
            filterOptions: FILTER_OPTIONS,
            context: CONTEXT,
            detailSupervisorId:
              PORTFOLIO_UNASSIGNED_SUPERVISOR_FILTER_ID,
            hasUnassignedAdvisors: true,
          });

        assert.equal(
          withoutUnassigned.isUnassignedSupervisorSelected,
          false
        );
        assert.equal(
          withoutUnassigned.detailSupervisorFilterValue,
          null
        );
        assert.equal(
          withUnassigned.isUnassignedSupervisorSelected,
          true
        );
        assert.equal(
          withUnassigned.detailSupervisorFilterValue,
          PORTFOLIO_UNASSIGNED_SUPERVISOR_FILTER_ID
        );
        assert.deepEqual(
          withUnassigned.contextualSupervisorOptions.map(
            (item) => item.id
          ),
          ['10', PORTFOLIO_UNASSIGNED_SUPERVISOR_FILTER_ID]
        );
      }
    ),
    test(
      'no expone supervisores de detalle mientras falta contexto de campaña',
      () => {
        const result = resolvePortfolioPerformanceSelection({
          filterOptions: FILTER_OPTIONS,
          context: null,
          detailSupervisorId: '10',
          hasUnassignedAdvisors: true,
        });

        assert.deepEqual(result.contextualSupervisorOptions, []);
        assert.equal(result.effectiveDetailSupervisorId, null);
      }
    ),
  ]
);
