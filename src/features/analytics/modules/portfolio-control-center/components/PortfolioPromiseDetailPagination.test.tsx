import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import { defineSuite, test } from '../../../../../test/testHarness';
import { PortfolioPromiseDetailPagination } from './PortfolioPromiseDetailPagination';

export const suite = defineSuite('PortfolioPromiseDetailPagination', [
  test('no renderiza paginación cuando no existen registros', () => {
    const html = renderToStaticMarkup(
      <PortfolioPromiseDetailPagination
        className="test-pagination"
        pagination={{ page: 1, pageSize: 5, totalItems: 0, totalPages: 0, hasPreviousPage: false, hasNextPage: false }}
        requestedPage={1}
        requestedPageSize={5}
        onPageChange={() => undefined}
        onPageSizeChange={() => undefined}
      />
    );
    assert.equal(html, '');
  }),
  test('renderiza la clase del modal y el rango confirmado por backend', () => {
    const html = renderToStaticMarkup(
      <PortfolioPromiseDetailPagination
        className="portfolio-overdue-table__pagination"
        pagination={{ page: 2, pageSize: 5, totalItems: 12, totalPages: 3, hasPreviousPage: true, hasNextPage: true }}
        requestedPage={2}
        requestedPageSize={5}
        onPageChange={() => undefined}
        onPageSizeChange={() => undefined}
      />
    );

    assert.match(html, /portfolio-overdue-table__pagination/);
    assert.match(html, /6/);
    assert.match(html, /10/);
    assert.match(html, /12/);
  }),
]);
