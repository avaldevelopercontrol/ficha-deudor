import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import type { Column } from '@shared/types';

import { PortfolioPromiseDistribution } from './PortfolioPromiseDistribution';
import { PortfolioPromiseSummary } from './PortfolioPromiseSummary';
import { PortfolioPromiseTableSection } from './PortfolioPromiseTableSection';

interface TestRow {
  id: string;
}

const COLUMNS: Column<TestRow>[] = [
  {
    key: 'id',
    label: 'ID',
    sortable: true,
  },
];

export const suite = defineSuite(
  'Portfolio promise presentation',
  [
    test('conserva las clases del resumen y sus variantes', () => {
      const html = renderToStaticMarkup(
        <PortfolioPromiseSummary
          className="portfolio-overdue-summary"
          items={[
            {
              key: 'count',
              icon: 'warning',
              label: 'Promesas vencidas',
              value: '7',
            },
            {
              key: 'amount',
              icon: 'target',
              label: 'Saldo pendiente',
              value: 'S/ 100.00',
              className: 'portfolio-overdue-summary__critical',
            },
          ]}
        />
      );

      assert.match(html, /class="portfolio-overdue-summary"/);
      assert.match(html, /portfolio-overdue-summary__icon/);
      assert.match(html, /portfolio-overdue-summary__critical/);
      assert.match(html, />Saldo pendiente</);
    }),
    test('conserva estado activo y modificador de una distribución', () => {
      const html = renderToStaticMarkup(
        <PortfolioPromiseDistribution
          className="portfolio-due-today-status-panel"
          title="Estado de cumplimiento"
          description="Distribución"
          cutoff="Hoy 11/09/2026"
          buckets={[
            { key: 'pending', label: 'Pendientes', count: 3 },
            { key: 'covered', label: 'Cubiertas', count: 1 },
          ]}
          activeKey="pending"
          maxCount={3}
          onToggle={() => undefined}
          getRowModifierClassName={(key) =>
            `portfolio-due-today-status-panel__row--${key}`
          }
        />
      );

      assert.match(
        html,
        /portfolio-due-today-status-panel__row portfolio-due-today-status-panel__row--pending is-active/
      );
      assert.match(html, /aria-pressed="true"/);
      assert.match(html, /width:100%/);
    }),
    test('mantiene toolbar, estado de refresco y tabla del detalle', () => {
      const html = renderToStaticMarkup(
        <PortfolioPromiseTableSection
          sectionClassName="portfolio-overdue-table-section"
          toolbarClassName="portfolio-overdue-table-toolbar"
          tableClassName="portfolio-overdue-table"
          filterId="portfolio-overdue-aging-filter"
          filterLabel="Antigüedad"
          filterValue="all"
          filterOptions={[
            { value: 'all', label: 'Todas' },
            { value: '1-3', label: '1 - 3 días' },
          ]}
          onFilterChange={() => undefined}
          isRefreshing
          refreshingMessage="Actualizando datos desde Analytics..."
          columns={COLUMNS}
          data={[{ id: 'D-1' }]}
          emptyMessage="Sin datos"
          sortKey="id"
          sortDirection="asc"
          onSortChange={() => undefined}
          pagination={null}
          requestedPage={1}
          requestedPageSize={5}
          onPageChange={() => undefined}
          onPageSizeChange={() => undefined}
        />
      );

      assert.match(html, /portfolio-overdue-table-section/);
      assert.match(html, /id="portfolio-overdue-aging-filter"/);
      assert.match(html, />Antigüedad</);
      assert.match(html, /portfolio-overdue-table__refreshing/);
      assert.match(html, />Actualizando datos desde Analytics/);
      assert.match(html, />D-1</);
    }),
  ]
);
