import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import type {
  PortfolioControlCenterFilterOptions,
  PortfolioControlCenterFilters,
} from '../domain/portfolioFilters.types';
import {
  PortfolioFilters,
} from './PortfolioFilters';

const FILTERS: PortfolioControlCenterFilters = {
  businessUnit: null,
  dateFrom: null,
  dateTo: null,
  subPortfolioId: null,
  campaignId: null,
  supervisorId: null,
};

const OPTIONS: PortfolioControlCenterFilterOptions = {
  availableDateFrom: '2026-08-01',
  availableDateTo: '2026-08-13',
  portfolio: { id: '95' },
  businessUnits: [
    {
      id: 'CLARO ADMINISTRATIVO',
      label: 'CLARO ADMINISTRATIVO',
    },
    {
      id: 'CLARO GOBIERNO',
      label: 'CLARO GOBIERNO',
    },
  ],
  selectedBusinessUnit: 'CLARO ADMINISTRATIVO',
  subPortfolios: [],
  campaigns: [],
  supervisors: [],
  availability: {
    subPortfolioCampaigns: [],
    supervisorContexts: [],
  },
};

export const suite = defineSuite(
  'PortfolioFilters',
  [
    test(
      'renderiza las carteras disponibles y conserva la selección resuelta por bootstrap',
      () => {
        const html = renderToStaticMarkup(
          <PortfolioFilters
            filters={FILTERS}
            options={OPTIONS}
            portfolioOption={{
              id: '95',
              label: 'CLARO CORPORATIVO',
            }}
            resolvedCampaignId={null}
            isLoading={false}
            error={null}
            onChange={() => undefined}
            onClear={() => undefined}
            onRetry={() => undefined}
          />
        );

        assert.match(html, />Cartera</);
        assert.match(html, /CLARO ADMINISTRATIVO/);
        assert.match(html, /CLARO GOBIERNO/);
        assert.match(
          html,
          /value="CLARO ADMINISTRATIVO" selected=""/
        );
      }
    ),
    test(
      'selecciona automáticamente el año y mes más recientes cuando la campaña actual aún no está disponible',
      () => {
        const html = renderToStaticMarkup(
          <PortfolioFilters
            filters={{
              ...FILTERS,
              businessUnit: 'CLARO GOBIERNO',
            }}
            options={{
              ...OPTIONS,
              selectedBusinessUnit: 'CLARO GOBIERNO',
              campaigns: [
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
            }}
            portfolioOption={{
              id: '95',
              label: 'CLARO CORPORATIVO',
            }}
            resolvedCampaignId={null}
            isLoading={false}
            error={null}
            onChange={() => undefined}
            onClear={() => undefined}
            onRetry={() => undefined}
          />
        );

        assert.doesNotMatch(html, /Selecciona año/);
        assert.match(
          html,
          /<option value="2026" selected="">2026<\/option>/
        );
        assert.match(
          html,
          /<option value="2026-08" selected="">Agosto<\/option>/
        );
        assert.doesNotMatch(html, /Selecciona mes/);
        assert.match(html, /Sub cartera<\/label><select[^>]*disabled=""/);
      }
    ),
  ]
);
