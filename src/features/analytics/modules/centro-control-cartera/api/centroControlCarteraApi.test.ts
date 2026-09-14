import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import type {
  PromesasCarteraVencidasQuery,
} from '../domain/promesasCartera.types';
import {
  buildRendimientoAsesorCarteraEndpoint,
  buildInicializacionCarteraEndpoint,
  buildPromesasCarteraVenceHoyEndpoint,
  buildPromesasCarteraVencidasEndpoint,
  buildSeguimientoPromesasCarteraEndpoint,
  buildPanoramaCarteraEndpoint,
  buildRendimientoSupervisorCarteraEndpoint,
  fetchCentroControlCarteraOverview,
} from './centroControlCarteraApi';

const OPERATIONAL_CONTEXT = {
  businessUnit: 'CLARO GOBIERNO',
  campaignId: '2026-08',
  dateFrom: '2026-08-05',
  dateTo: '2026-08-13',
  subPortfolioId: '29',
} as const;

export const suite = defineSuite(
  'centroControlCarteraApi',
  [
    test(
      'construye Bootstrap con el contexto canonico sin propagar supervisor',
      () => {
        const endpoint = buildInicializacionCarteraEndpoint({
          businessUnit: 'CLARO GOBIERNO',
          dateFrom: '2026-08-01',
          dateTo: '2026-08-13',
          subPortfolioId: '99',
          campaignId: '2026-08',
          supervisorId: '1',
        });

        assert.equal(
          endpoint,
          '/v1/Analitica/CentroControlCartera/Inicializacion?campana=2026-08&unidadNegocio=CLARO+GOBIERNO&fechaDesde=2026-08-01&fechaHasta=2026-08-13&idSubCartera=99'
        );
      }
    ),
    test(
      'construye Overview con el contexto canonico y normaliza textos de query',
      () => {
        const endpoint = buildPanoramaCarteraEndpoint({
          businessUnit: ' CLARO GOBIERNO ',
          dateFrom: ' 2026-08-01 ',
          dateTo: ' 2026-08-13 ',
          subPortfolioId: ' 99 ',
          campaignId: ' 2026-08 ',
          supervisorId: null,
        });

        assert.equal(
          endpoint,
          '/v1/Analitica/CentroControlCartera/Panorama?campana=2026-08&unidadNegocio=CLARO+GOBIERNO&fechaDesde=2026-08-01&fechaHasta=2026-08-13&idSubCartera=99'
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
          buildInicializacionCarteraEndpoint(filters),
          '/v1/Analitica/CentroControlCartera/Inicializacion'
        );
        assert.equal(
          buildPanoramaCarteraEndpoint(filters),
          '/v1/Analitica/CentroControlCartera/Panorama'
        );
      }
    ),
    test(
      'construye el detalle de promesas vencidas con query tipada',
      () => {
        assert.equal(
          buildPromesasCarteraVencidasEndpoint(
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
          '/v1/Analitica/CentroControlCartera/Promesas/Vencidas?campana=2026-08&unidadNegocio=CLARO+GOBIERNO&idSubCartera=29&pagina=2&tamanoPagina=25&antiguedad=4-7&ordenarPor=diasVencimiento&direccionOrden=desc'
        );
      }
    ),
    test(
      'omite aging cuando el detalle de vencidas solicita todas las promesas',
      () => {
        assert.equal(
          buildPromesasCarteraVencidasEndpoint(
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
          '/v1/Analitica/CentroControlCartera/Promesas/Vencidas?campana=2026-08&pagina=1&tamanoPagina=5&ordenarPor=fechaVencimiento&direccionOrden=asc'
        );
      }
    ),
    test(
      'construye el detalle de promesas de hoy con query tipada',
      () => {
        assert.equal(
          buildPromesasCarteraVenceHoyEndpoint(
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
          '/v1/Analitica/CentroControlCartera/Promesas/VenceHoy?campana=2026-08&unidadNegocio=CLARO+GOBIERNO&idSubCartera=29&pagina=1&tamanoPagina=10&estado=pendiente&ordenarPor=montoPendiente&direccionOrden=desc'
        );
      }
    ),
    test(
      'construye seguimiento de promesas para una fecha explícita',
      () => {
        assert.equal(
          buildSeguimientoPromesasCarteraEndpoint(
            {
              businessUnit: 'CLARO CORPORATIVO',
              campaignId: '2026-09',
              subPortfolioId: '602',
            },
            {
              dueDate: '2026-09-14',
              page: 2,
              pageSize: 10,
              status: 'fulfilled',
              sortBy: 'outstandingAmount',
              sortDirection: 'desc',
            }
          ),
          '/v1/Analitica/CentroControlCartera/Promesas/Seguimiento?campana=2026-09&unidadNegocio=CLARO+CORPORATIVO&idSubCartera=602&fechaVencimiento=2026-09-14&pagina=2&tamanoPagina=10&estado=cumplida&ordenarPor=montoPendiente&direccionOrden=desc'
        );
      }
    ),
    test(
      'construye Supervisor Performance desde un contexto operacional unico',
      () => {
        assert.equal(
          buildRendimientoSupervisorCarteraEndpoint(
            OPERATIONAL_CONTEXT
          ),
          '/v1/Analitica/CentroControlCartera/RendimientoSupervisor?campana=2026-08&unidadNegocio=CLARO+GOBIERNO&fechaDesde=2026-08-05&fechaHasta=2026-08-13&idSubCartera=29'
        );
      }
    ),
    test(
      'construye Advisor Performance con supervisor atribuible',
      () => {
        assert.equal(
          buildRendimientoAsesorCarteraEndpoint(
            OPERATIONAL_CONTEXT,
            '1'
          ),
          '/v1/Analitica/CentroControlCartera/RendimientoAsesor?campana=2026-08&unidadNegocio=CLARO+GOBIERNO&fechaDesde=2026-08-05&fechaHasta=2026-08-13&idSubCartera=29&idSupervisor=1'
        );
      }
    ),
    test(
      'rechaza fechas imposibles y rangos invertidos antes de ejecutar HTTP',
      () => {
        assert.throws(
          () =>
            buildPanoramaCarteraEndpoint({
              businessUnit: null,
              dateFrom: '2026-02-30',
              dateTo: '2026-03-01',
              subPortfolioId: null,
              campaignId: '2026-03',
              supervisorId: null,
            }),
          /fechaDesde debe usar el formato YYYY-MM-DD/
        );

        assert.throws(
          () =>
            buildRendimientoAsesorCarteraEndpoint({
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
            buildPromesasCarteraVencidasEndpoint(
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
        } as unknown as PromesasCarteraVencidasQuery;

        assert.throws(
          () =>
            buildPromesasCarteraVencidasEndpoint(
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
              fetchCentroControlCarteraOverview(
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
            /idClienteCrm debe ser un entero positivo/
          );
          assert.equal(requestCount, 0);
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
  ]
);
