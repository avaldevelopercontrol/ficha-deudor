import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import type {
  PortfolioControlCenterFilterOptions,
  PortfolioControlCenterFilters,
} from '../domain/portfolioFilters.types';
import {
  changePortfolioBusinessUnit,
  changePortfolioCampaignYear,
  changePortfolioSubPortfolio,
  resolveAutomaticPortfolioCampaignSelection,
  resolvePortfolioFiltersViewModel,
} from './portfolioFilters.application';

const OPTIONS: PortfolioControlCenterFilterOptions = {
  availableDateFrom: '2026-07-01',
  availableDateTo: '2026-08-13',
  portfolio: { id: '95' },
  businessUnits: [
    { id: 'ADMIN', label: 'Administrativo' },
    { id: 'GOB', label: 'Gobierno' },
  ],
  selectedBusinessUnit: 'ADMIN',
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
      availableDateTo: '2026-08-13',
    },
  ],
  supervisors: [{ id: '2', label: 'Supervisor vigente' }],
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
        availableDateTo: '2026-08-12',
      },
    ],
    supervisorContexts: [
      {
        supervisorId: '2',
        subPortfolioId: '20',
        campaignId: '2026-08',
        availableDateFrom: '2026-08-02',
        availableDateTo: '2026-08-12',
      },
    ],
  },
};

const FILTERS: PortfolioControlCenterFilters = {
  businessUnit: 'ADMIN',
  dateFrom: '2026-08-05',
  dateTo: '2026-08-13',
  subPortfolioId: '20',
  campaignId: '2026-08',
  supervisorId: '2',
};

export const suite = defineSuite(
  'portfolioFilters.application',
  [
    test('deriva la campaña, año, mes y límites del contexto visible', () => {
      const model = resolvePortfolioFiltersViewModel({
        filters: FILTERS,
        options: OPTIONS,
        portfolioOption: null,
        resolvedCampaignId: '2026-08',
      });

      assert.equal(model.effectiveCampaign?.id, '2026-08');
      assert.equal(model.displayedCampaign?.id, '2026-08');
      assert.equal(model.selectedCampaignYear, 2026);
      assert.deepEqual(model.campaignMonthOptions, [
        { id: '2026-08', label: 'Agosto' },
      ]);
      assert.deepEqual(model.dateBounds, {
        min: '2026-08-02',
        max: '2026-08-12',
      });
    }),
    test('al cambiar a una subcartera incompatible limpia campaña, fechas fuera de rango y supervisor', () => {
      const result = changePortfolioSubPortfolio(
        FILTERS,
        OPTIONS,
        '10'
      );

      assert.equal(result.subPortfolioId, '10');
      assert.equal(result.campaignId, null);
      assert.equal(result.dateFrom, null);
      assert.equal(result.dateTo, null);
      assert.equal(result.supervisorId, null);
    }),
    test('al cambiar subcartera sin campaña conserva sólo supervisores disponibles en esa subcartera', () => {
      const result = changePortfolioSubPortfolio(
        {
          ...FILTERS,
          campaignId: null,
          supervisorId: '2',
        },
        OPTIONS,
        '10'
      );

      assert.equal(result.campaignId, null);
      assert.equal(result.supervisorId, null);
    }),
    test('seleccionar un año aplica la campaña más reciente disponible en la subcartera', () => {
      const result = changePortfolioCampaignYear(
        {
          ...FILTERS,
          subPortfolioId: '10',
          campaignId: null,
          supervisorId: null,
        },
        OPTIONS,
        2026
      );

      assert.equal(result.campaignId, '2026-07');
    }),
    test('la selección automática de campaña conserva solo fechas dentro del rango disponible', () => {
      const result = resolveAutomaticPortfolioCampaignSelection(
        {
          ...FILTERS,
          campaignId: null,
          dateFrom: '2026-08-03',
          dateTo: '2026-08-13',
        },
        OPTIONS,
        OPTIONS.campaigns[1] ?? null
      );

      assert.equal(result?.campaignId, '2026-08');
      assert.equal(result?.dateFrom, '2026-08-03');
      assert.equal(result?.dateTo, null);
      assert.equal(result?.supervisorId, null);
    }),
    test('cambiar cartera reinicia el contexto dependiente y no emite cambio si es la misma', () => {
      assert.equal(
        changePortfolioBusinessUnit(FILTERS, 'ADMIN', 'ADMIN'),
        null
      );

      assert.deepEqual(
        changePortfolioBusinessUnit(FILTERS, 'GOB', 'ADMIN'),
        {
          ...FILTERS,
          businessUnit: 'GOB',
          dateFrom: null,
          dateTo: null,
          subPortfolioId: null,
          campaignId: null,
          supervisorId: null,
        }
      );
    }),
  ]
);
