import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import type {
  PortfolioOverduePromisesQuery,
} from '../domain/portfolioPromises.types';
import {
  buildPortfolioAdvisorPerformanceEndpoint,
  buildPortfolioBootstrapEndpoint,
  buildPortfolioDueTodayPromisesEndpoint,
  buildPortfolioOverduePromisesEndpoint,
  buildPortfolioOverviewEndpoint,
  buildPortfolioSupervisorPerformanceEndpoint,
  fetchPortfolioControlCenterOverview,
} from './portfolioControlCenterApi';

const OPERATIONAL_CONTEXT = {
  businessUnit: 'CLARO GOBIERNO',
  campaignId: '2026-08',
  dateFrom: '2026-08-05',
  dateTo: '2026-08-13',
  subPortfolioId: '29',
} as const;

export const suite = defineSuite(
  'portfolioControlCenterApi',
  [
    test(
      'construye Bootstrap con el contexto canonico sin propagar supervisor',
      () => {
        const endpoint = buildPortfolioBootstrapEndpoint({
          businessUnit: 'CLARO GOBIERNO',
          dateFrom: '2026-08-01',
          dateTo: '2026-08-13',
          subPortfolioId: '99',
          campaignId: '2026-08',
          supervisorId: '1',
        });

        assert.equal(
          endpoint,
          '/api/v1/portfolio-control-center/bootstrap?campaign=2026-08&businessUnit=CLARO+GOBIERNO&dateFrom=2026-08-01&dateTo=2026-08-13&subPortfolioId=99'
        );
      }
    ),
    test(
      'construye Overview con el contexto canonico y normaliza textos de query',
      () => {
        const endpoint = buildPortfolioOverviewEndpoint({
          businessUnit: ' CLARO GOBIERNO ',
          dateFrom: ' 2026-08-01 ',
          dateTo: ' 2026-08-13 ',
          subPortfolioId: ' 99 ',
          campaignId: ' 2026-08 ',
          supervisorId: null,
        });

        assert.equal(
          endpoint,
          '/api/v1/portfolio-control-center/overview?campaign=2026-08&businessUnit=CLARO+GOBIERNO&dateFrom=2026-08-01&dateTo=2026-08-13&subPortfolioId=99'
        );
      }
    ),
    test(
      'no agrega query string cuando Bootstrap y Overview usan el contexto por defecto',
      () => {
        const filters = {
          businessUnit: null,
          dateFrom: null,
          dateTo: null,
          subPortfolioId: null,
          campaignId: null,
          supervisorId: null,
        } as const;

        assert.equal(
          buildPortfolioBootstrapEndpoint(filters),
          '/api/v1/portfolio-control-center/bootstrap'
        );
        assert.equal(
          buildPortfolioOverviewEndpoint(filters),
          '/api/v1/portfolio-control-center/overview'
        );
      }
    ),
    test(
      'construye el detalle de promesas vencidas con query tipada',
      () => {
        assert.equal(
          buildPortfolioOverduePromisesEndpoint(
            {
              businessUnit: 'CLARO GOBIERNO',
              campaignId: '2026-08',
              subPortfolioId: '29',
            },
            {
              page: 2,
              pageSize: 25,
              aging: '4-7',
              sortBy: 'overdueDays',
              sortDirection: 'desc',
            }
          ),
          '/api/v1/portfolio-control-center/promises/overdue?campaign=2026-08&businessUnit=CLARO+GOBIERNO&subPortfolioId=29&page=2&pageSize=25&aging=4-7&sortBy=overdueDays&sortDirection=desc'
        );
      }
    ),
    test(
      'omite aging cuando el detalle de vencidas solicita todas las promesas',
      () => {
        assert.equal(
          buildPortfolioOverduePromisesEndpoint(
            {
              businessUnit: null,
              campaignId: '2026-08',
              subPortfolioId: null,
            },
            {
              page: 1,
              pageSize: 5,
              aging: null,
              sortBy: 'dueDate',
              sortDirection: 'asc',
            }
          ),
          '/api/v1/portfolio-control-center/promises/overdue?campaign=2026-08&page=1&pageSize=5&sortBy=dueDate&sortDirection=asc'
        );
      }
    ),
    test(
      'construye el detalle de promesas de hoy con query tipada',
      () => {
        assert.equal(
          buildPortfolioDueTodayPromisesEndpoint(
            {
              businessUnit: 'CLARO GOBIERNO',
              campaignId: '2026-08',
              subPortfolioId: '29',
            },
            {
              page: 1,
              pageSize: 10,
              status: 'pending',
              sortBy: 'outstandingAmount',
              sortDirection: 'desc',
            }
          ),
          '/api/v1/portfolio-control-center/promises/due-today?campaign=2026-08&businessUnit=CLARO+GOBIERNO&subPortfolioId=29&page=1&pageSize=10&status=pending&sortBy=outstandingAmount&sortDirection=desc'
        );
      }
    ),
    test(
      'construye Supervisor Performance desde un contexto operacional unico',
      () => {
        assert.equal(
          buildPortfolioSupervisorPerformanceEndpoint(
            OPERATIONAL_CONTEXT
          ),
          '/api/v1/portfolio-control-center/supervisor-performance?campaign=2026-08&businessUnit=CLARO+GOBIERNO&dateFrom=2026-08-05&dateTo=2026-08-13&subPortfolioId=29'
        );
      }
    ),
    test(
      'construye Advisor Performance con supervisor atribuible',
      () => {
        assert.equal(
          buildPortfolioAdvisorPerformanceEndpoint(
            OPERATIONAL_CONTEXT,
            '1'
          ),
          '/api/v1/portfolio-control-center/advisor-performance?campaign=2026-08&businessUnit=CLARO+GOBIERNO&dateFrom=2026-08-05&dateTo=2026-08-13&subPortfolioId=29&supervisorId=1'
        );
      }
    ),
    test(
      'rechaza fechas imposibles y rangos invertidos antes de ejecutar HTTP',
      () => {
        assert.throws(
          () =>
            buildPortfolioOverviewEndpoint({
              businessUnit: null,
              dateFrom: '2026-02-30',
              dateTo: '2026-03-01',
              subPortfolioId: null,
              campaignId: '2026-03',
              supervisorId: null,
            }),
          /dateFrom debe usar el formato YYYY-MM-DD/
        );

        assert.throws(
          () =>
            buildPortfolioAdvisorPerformanceEndpoint({
              ...OPERATIONAL_CONTEXT,
              dateFrom: '2026-08-14',
              dateTo: '2026-08-13',
            }),
          /dateFrom no puede ser posterior a dateTo/
        );
      }
    ),
    test(
      'rechaza paginacion y criterios fuera de contrato antes de ejecutar HTTP',
      () => {
        assert.throws(
          () =>
            buildPortfolioOverduePromisesEndpoint(
              {
                businessUnit: null,
                campaignId: '2026-08',
                subPortfolioId: null,
              },
              {
                page: 0,
                pageSize: 25,
                aging: null,
                sortBy: 'dueDate',
                sortDirection: 'asc',
              }
            ),
          /page debe ser un entero positivo/
        );

        const invalidQuery = {
          page: 1,
          pageSize: 25,
          aging: 'otro',
          sortBy: 'unknown',
          sortDirection: 'asc',
        } as unknown as PortfolioOverduePromisesQuery;

        assert.throws(
          () =>
            buildPortfolioOverduePromisesEndpoint(
              {
                businessUnit: null,
                campaignId: '2026-08',
                subPortfolioId: null,
              },
              invalidQuery
            ),
          /aging no es un valor soportado/
        );
      }
    ),
    test(
      'rechaza crmClientId invalido antes de iniciar la solicitud',
      async () => {
        const originalFetch = globalThis.fetch;
        let requestCount = 0;

        globalThis.fetch = async () => {
          requestCount += 1;
          throw new Error('No debe ejecutarse HTTP');
        };

        try {
          await assert.rejects(
            () =>
              fetchPortfolioControlCenterOverview(
                0,
                {
                  businessUnit: null,
                  dateFrom: null,
                  dateTo: null,
                  subPortfolioId: null,
                  campaignId: null,
                  supervisorId: null,
                },
                new AbortController().signal
              ),
            /crmClientId debe ser un entero positivo/
          );
          assert.equal(requestCount, 0);
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
  ]
);
