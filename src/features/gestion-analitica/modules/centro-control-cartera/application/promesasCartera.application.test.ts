import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import {
  buildPromesasCarteraVenceHoyQuery,
  buildPromesasCarteraVencidasQuery,
  buildSeguimientoPromesasCarteraQuery,
  loadAllSeguimientoPromesasCartera,
} from './promesasCartera.application';

export const suite = defineSuite(
  'promesasCartera.application',
  [
    test('normaliza aging all a null conservando paginación y orden', () => {
      assert.deepEqual(
        buildPromesasCarteraVencidasQuery(
          2,
          50,
          'all',
          'outstandingAmount',
          'desc'
        ),
        {
          page: 2,
          pageSize: 50,
          aging: null,
          sortBy: 'outstandingAmount',
          sortDirection: 'desc',
        }
      );
    }),
    test('normaliza status all a null conservando paginación y orden', () => {
      assert.deepEqual(
        buildPromesasCarteraVenceHoyQuery(
          1,
          25,
          'all',
          'debtorId',
          'asc'
        ),
        {
          page: 1,
          pageSize: 25,
          status: null,
          sortBy: 'debtorId',
          sortDirection: 'asc',
        }
      );
    }),
    test('construye seguimiento por fecha sin acoplar Hoy/Ayer al contrato HTTP', () => {
      assert.deepEqual(
        buildSeguimientoPromesasCarteraQuery(
          '2026-09-13',
          1,
          10,
          'all',
          'outstandingAmount',
          'desc'
        ),
        {
          dueDate: '2026-09-13',
          page: 1,
          pageSize: 10,
          status: null,
          sortBy: 'outstandingAmount',
          sortDirection: 'desc',
        }
      );
    }),

    test('exporta seguimiento recorriendo todas las páginas confirmadas por Analytics', async () => {
      const originalFetch = globalThis.fetch;
      const requests: string[] = [];

      globalThis.fetch = async (input) => {
        const url = String(input);
        requests.push(url);
        const requestUrl = new URL(url, 'http://localhost');
        const page = Number(requestUrl.searchParams.get('pagina'));
        const pageSize = Number(requestUrl.searchParams.get('tamanoPagina'));
        const itemCount = page === 1 ? 50 : 1;
        const startId = page === 1 ? 1 : 51;

        return new Response(
          JSON.stringify({
            campaign: { code: '2026-09', name: 'Septiembre 2026' },
            dueDate: '2026-09-16',
            asOfDate: '2026-09-16',
            updatedAt: null,
            summary: {
              promiseCount: 51,
              promiseAmount: 5100,
              paidAmount: 0,
              outstandingAmount: 5100,
            },
            status: [],
            pagination: {
              page,
              pageSize,
              totalItems: 51,
              totalPages: 2,
              hasPreviousPage: page > 1,
              hasNextPage: page < 2,
            },
            items: Array.from({ length: itemCount }, (_, index) => {
              const id = startId + index;

              return {
                promiseId: id,
                debtorId: 1000 + id,
                debtorName: `DEUDOR ${id}`,
                dueDate: '2026-09-16',
                promiseAmount: 100,
                paidAmount: 0,
                outstandingAmount: 100,
                lastPaymentDate: null,
                statusKey: 'pending',
                managed: false,
                managementCount: 0,
                callCount: 0,
                contactKey: 'no-management',
                contactLabel: 'Sin gestión',
                paymentConfirmed: null,
                lastManagementAt: null,
                advisorId: null,
                advisorName: null,
                supervisorId: null,
                supervisorName: null,
              };
            }),
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      };

      try {
        const items = await loadAllSeguimientoPromesasCartera(
          95,
          {
            businessUnit: 'CLARO CORPORATIVO',
            campaignId: '2026-09',
            subPortfolioId: '602',
          },
          {
            dueDate: '2026-09-16',
            status: null,
            sortBy: 'outstandingAmount',
            sortDirection: 'desc',
          },
          new AbortController().signal
        );

        assert.equal(items.length, 51);
        assert.equal(requests.length, 2);
        assert.match(requests[0] ?? '', /(?:\?|&)pagina=1(?:&|$)/);
        assert.match(requests[1] ?? '', /(?:\?|&)pagina=2(?:&|$)/);
        requests.forEach((url) => {
          assert.match(url, /(?:\?|&)tamanoPagina=50(?:&|$)/);
          assert.match(url, /(?:\?|&)idClienteCrm=95(?:&|$)/);
        });
      } finally {
        globalThis.fetch = originalFetch;
      }
    }),
  ]
);
