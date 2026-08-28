import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import type {
  PortfolioControlCenterFilterOptions,
} from '../../../types/portfolioControlCenter.types';
import {
  getLatestPortfolioCampaign,
  getPortfolioCampaignMonthOptions,
  getPortfolioCampaignYearOptions,
  getPortfolioFilterDateBounds,
  getPortfolioSupervisorOptionsForContext,
  keepDateWithinBounds,
  PORTFOLIO_UNASSIGNED_SUPERVISOR_FILTER_ID,
} from './portfolioFilterContext.utils';

const OPTIONS: PortfolioControlCenterFilterOptions = {
  availableDateFrom: '2026-07-01',
  availableDateTo: '2026-08-13',
  portfolio: { id: '95' },
  subPortfolios: [
    { id: '10', label: 'Subcartera histórica' },
    { id: '20', label: 'Subcartera vigente' },
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
  supervisors: [
    { id: '1', label: 'Supervisor julio' },
    { id: '2', label: 'Supervisor vigente' },
    { id: '3', label: 'Supervisor otra subcartera' },
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
        campaignId: '2026-07',
        availableDateFrom: '2026-07-05',
        availableDateTo: '2026-07-30',
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
        availableDateTo: '2026-08-12',
      },
      {
        supervisorId: '3',
        subPortfolioId: '10',
        campaignId: '2026-08',
        availableDateFrom: '2026-08-01',
        availableDateTo: '2026-08-10',
      },
    ],
  },
};

const MULTI_YEAR_OPTIONS: PortfolioControlCenterFilterOptions = {
  ...OPTIONS,
  campaigns: [
    ...OPTIONS.campaigns,
    {
      id: '2025-12',
      label: 'Diciembre 2025',
      year: 2025,
      month: 12,
      startDate: '2025-12-01',
      endDate: '2025-12-31',
      availableDateFrom: '2025-12-01',
      availableDateTo: '2025-12-31',
    },
  ],
};

export const suite = defineSuite(
  'portfolioFilterContext.utils',
  [
    test(
      'resuelve la campaña más reciente sin depender del orden recibido',
      () => {
        assert.equal(
          getLatestPortfolioCampaign(OPTIONS)?.id,
          '2026-08'
        );
      }
    ),
    test(
      'expone años de campaña únicos y ordenados sin parsear el nombre',
      () => {
        assert.deepEqual(
          getPortfolioCampaignYearOptions(
            MULTI_YEAR_OPTIONS
          ),
          [
            { id: '2026', label: '2026' },
            { id: '2025', label: '2025' },
          ]
        );
      }
    ),
    test(
      'expone meses separados del año y mantiene el código canonical como id',
      () => {
        assert.deepEqual(
          getPortfolioCampaignMonthOptions(
            OPTIONS,
            2026
          ),
          [
            { id: '2026-08', label: 'Agosto' },
            { id: '2026-07', label: 'Julio' },
          ]
        );
      }
    ),
    test(
      'resuelve el último mes disponible dentro de un año y subcartera',
      () => {
        assert.equal(
          getLatestPortfolioCampaign(
            MULTI_YEAR_OPTIONS,
            null,
            2025
          )?.id,
          '2025-12'
        );
        assert.equal(
          getLatestPortfolioCampaign(
            OPTIONS,
            '10',
            2026
          )?.id,
          '2026-07'
        );
      }
    ),
    test(
      'resuelve la campaña más reciente disponible para la subcartera seleccionada',
      () => {
        assert.equal(
          getLatestPortfolioCampaign(OPTIONS, '10')?.id,
          '2026-07'
        );
        assert.equal(
          getLatestPortfolioCampaign(OPTIONS, '20')?.id,
          '2026-08'
        );
      }
    ),
    test(
      'usa el rango disponible de la campaña seleccionada',
      () => {
        assert.deepEqual(
          getPortfolioFilterDateBounds(
            OPTIONS,
            '2026-07',
            true
          ),
          {
            min: '2026-07-01',
            max: '2026-07-31',
          }
        );
      }
    ),
    test(
      'usa el rango específico de subcartera y campaña cuando existe',
      () => {
        assert.deepEqual(
          getPortfolioFilterDateBounds(
            OPTIONS,
            '2026-08',
            true,
            '20'
          ),
          {
            min: '2026-08-02',
            max: '2026-08-12',
          }
        );
      }
    ),
    test(
      'usa la última campaña compatible con la subcartera cuando campaign está vacío',
      () => {
        assert.deepEqual(
          getPortfolioFilterDateBounds(
            OPTIONS,
            null,
            true,
            '10'
          ),
          {
            min: '2026-07-03',
            max: '2026-07-28',
          }
        );
      }
    ),
    test(
      'usa la última campaña cuando la API resuelve campaign vacío como latest',
      () => {
        assert.deepEqual(
          getPortfolioFilterDateBounds(
            OPTIONS,
            null,
            true
          ),
          {
            min: '2026-08-01',
            max: '2026-08-13',
          }
        );
      }
    ),
    test(
      'conserva el rango global en modo mock cuando campaign vacío significa todas',
      () => {
        assert.deepEqual(
          getPortfolioFilterDateBounds(
            OPTIONS,
            null,
            false
          ),
          {
            min: '2026-07-01',
            max: '2026-08-13',
          }
        );
      }
    ),

    test(
      'limita supervisores al contexto efectivo de campaña y subcartera',
      () => {
        assert.deepEqual(
          getPortfolioSupervisorOptionsForContext(
            OPTIONS,
            '2026-08',
            '20'
          ),
          [
            {
              id: '2',
              label: 'Supervisor vigente',
            },
          ]
        );

        assert.deepEqual(
          getPortfolioSupervisorOptionsForContext(
            OPTIONS,
            '2026-08',
            null
          ).map((item) => item.id),
          ['2', '3']
        );
      }
    ),
    test(
      'agrega Sin supervisor al contexto cuando existen asesores sin asignación',
      () => {
        const options = getPortfolioSupervisorOptionsForContext(
          OPTIONS,
          '2026-08',
          '20',
          true
        );

        assert.deepEqual(options, [
          { id: '2', label: 'Supervisor vigente' },
          {
            id: PORTFOLIO_UNASSIGNED_SUPERVISOR_FILTER_ID,
            label: 'Sin supervisor',
          },
        ]);
      }
    ),
    test(
      'limpia fechas que quedan fuera del nuevo contexto de campaña o subcartera',
      () => {
        const bounds = {
          min: '2026-08-02',
          max: '2026-08-12',
        };

        assert.equal(
          keepDateWithinBounds('2026-08-01', bounds),
          null
        );
        assert.equal(
          keepDateWithinBounds('2026-08-10', bounds),
          '2026-08-10'
        );
        assert.equal(
          keepDateWithinBounds('2026-08-13', bounds),
          null
        );
      }
    ),
  ]
);
