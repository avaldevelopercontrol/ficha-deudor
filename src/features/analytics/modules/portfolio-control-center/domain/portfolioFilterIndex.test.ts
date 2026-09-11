import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import type {
  PortfolioControlCenterFilterOptions,
} from './portfolioFilters.types';
import {
  buildPortfolioFilterIndex,
  getIndexedSubPortfolioCampaignAvailability,
  getIndexedSupervisorIds,
  hasIndexedSupervisorContext,
  isPortfolioCampaignAvailable,
} from './portfolioFilterIndex';

const OPTIONS: PortfolioControlCenterFilterOptions = {
  availableDateFrom: '2026-07-01',
  availableDateTo: '2026-08-31',
  portfolio: { id: '95' },
  businessUnits: [],
  selectedBusinessUnit: null,
  subPortfolios: [
    { id: '10', label: 'Histórica' },
    { id: '20', label: 'Vigente' },
  ],
  campaigns: [
    {
      id: '2026-07',
      label: 'Julio 2026',
      year: 2026,
      month: 7,
      startDate: '2026-07-01',
      endDate: '2026-07-31',
      availableDateFrom: '2026-07-01',
      availableDateTo: '2026-07-31',
    },
    {
      id: '2026-08',
      label: 'Agosto 2026',
      year: 2026,
      month: 8,
      startDate: '2026-08-01',
      endDate: '2026-08-31',
      availableDateFrom: '2026-08-01',
      availableDateTo: '2026-08-31',
    },
  ],
  supervisors: [
    { id: '1', label: 'Supervisor uno' },
    { id: '2', label: 'Supervisor dos' },
  ],
  availability: {
    subPortfolioCampaigns: [
      {
        subPortfolioId: '10',
        campaignId: '2026-07',
        availableDateFrom: '2026-07-03',
        availableDateTo: '2026-07-28',
      },
      {
        subPortfolioId: '20',
        campaignId: '2026-08',
        availableDateFrom: '2026-08-02',
        availableDateTo: '2026-08-29',
      },
    ],
    supervisorContexts: [
      {
        supervisorId: '1',
        subPortfolioId: '10',
        campaignId: '2026-07',
        availableDateFrom: '2026-07-03',
        availableDateTo: '2026-07-28',
      },
      {
        supervisorId: '2',
        subPortfolioId: '20',
        campaignId: '2026-08',
        availableDateFrom: '2026-08-02',
        availableDateTo: '2026-08-29',
      },
    ],
  },
};

export const suite = defineSuite(
  'portfolioFilterIndex domain',
  [
    test('indexa campañas y disponibilidad por subcartera en accesos directos', () => {
      const index = buildPortfolioFilterIndex(OPTIONS);

      assert.equal(index.campaignsById.get('2026-08')?.label, 'Agosto 2026');
      assert.equal(
        isPortfolioCampaignAvailable(index, '2026-07', '10'),
        true
      );
      assert.equal(
        isPortfolioCampaignAvailable(index, '2026-08', '10'),
        false
      );
      assert.deepEqual(
        getIndexedSubPortfolioCampaignAvailability(
          index,
          '20',
          '2026-08'
        ),
        {
          subPortfolioId: '20',
          campaignId: '2026-08',
          availableDateFrom: '2026-08-02',
          availableDateTo: '2026-08-29',
        }
      );
    }),
    test('indexa supervisores por campaña y por contexto de subcartera', () => {
      const index = buildPortfolioFilterIndex(OPTIONS);

      assert.deepEqual(
        [...getIndexedSupervisorIds(index, '2026-08', null)],
        ['2']
      );
      assert.deepEqual(
        [...getIndexedSupervisorIds(index, '2026-08', '20')],
        ['2']
      );
      assert.deepEqual(
        [...getIndexedSupervisorIds(index, '2026-08', '10')],
        []
      );
      assert.equal(
        hasIndexedSupervisorContext(index, '2', '2026-08', '20'),
        true
      );
      assert.equal(
        hasIndexedSupervisorContext(index, '2', '2026-08', '10'),
        false
      );
    }),
    test('una campaña sin subcartera se considera disponible sin depender del catálogo de availability', () => {
      const index = buildPortfolioFilterIndex(OPTIONS);

      assert.equal(
        isPortfolioCampaignAvailable(index, '2026-08', null),
        true
      );
    }),
    test('valida supervisor por subcartera aunque todavía no exista campaña seleccionada', () => {
      const index = buildPortfolioFilterIndex(OPTIONS);

      assert.equal(
        hasIndexedSupervisorContext(index, '1', null, '10'),
        true
      );
      assert.equal(
        hasIndexedSupervisorContext(index, '2', null, '10'),
        false
      );
    }),
  ]
);
