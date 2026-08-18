import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import {
  buildPortfolioAdvisorPerformanceEndpoint,
  buildPortfolioCampaignPerformanceEndpoint,
  buildPortfolioEvolutionEndpoint,
  buildPortfolioPromisesEndpoint,
  buildPortfolioOverduePromisesEndpoint,
  buildPortfolioDueTodayPromisesEndpoint,
  buildPortfolioSummaryEndpoint,
  buildPortfolioSupervisorPerformanceEndpoint,
  buildPortfolioTargetProgressEndpoint,
} from './portfolioControlCenterApi';

export const suite = defineSuite(
  'portfolioControlCenterApi',
  [
    test(
      'construye Summary con campaña fechas y subcartera pero nunca con supervisor',
      () => {
        const endpoint = buildPortfolioSummaryEndpoint({
          dateFrom: '2026-08-01',
          dateTo: '2026-08-13',
          subPortfolioId: '99',
          campaignId: '2026-08',
          supervisorId: '1',
        });

        assert.equal(
          endpoint,
          '/api/v1/portfolio-control-center/summary?campaign=2026-08&dateFrom=2026-08-01&dateTo=2026-08-13&subPortfolioId=99'
        );
      }
    ),
    test(
      'construye Target Progress con el contexto efectivo y la subcartera seleccionada',
      () => {
        assert.equal(
          buildPortfolioTargetProgressEndpoint(
            '2026-08',
            '2026-08-13',
            '29'
          ),
          '/api/v1/portfolio-control-center/target-progress?campaign=2026-08&dateTo=2026-08-13&subPortfolioId=29'
        );
      }
    ),
    test(
      'construye Promises con campaña y subcartera sin inventar filtros de fecha',
      () => {
        assert.equal(
          buildPortfolioPromisesEndpoint(
            '2026-08',
            '29'
          ),
          '/api/v1/portfolio-control-center/promises?campaign=2026-08&subPortfolioId=29'
        );
      }
    ),
    test(
      'construye el detalle completo de promesas vencidas solo con el contexto global',
      () => {
        assert.equal(
          buildPortfolioOverduePromisesEndpoint(
            '2026-08',
            '29'
          ),
          '/api/v1/portfolio-control-center/promises/overdue?campaign=2026-08&subPortfolioId=29'
        );
      }
    ),
    test(
      'construye el detalle completo de promesas que vencen hoy solo con el contexto global',
      () => {
        assert.equal(
          buildPortfolioDueTodayPromisesEndpoint(
            '2026-08',
            '29'
          ),
          '/api/v1/portfolio-control-center/promises/due-today?campaign=2026-08&subPortfolioId=29'
        );
      }
    ),
    test(
      'construye Evolution con el contexto efectivo y la subcartera seleccionada',
      () => {
        assert.equal(
          buildPortfolioEvolutionEndpoint(
            '2026-08',
            '2026-08-01',
            '2026-08-13',
            '29'
          ),
          '/api/v1/portfolio-control-center/evolution?campaign=2026-08&dateFrom=2026-08-01&dateTo=2026-08-13&subPortfolioId=29'
        );
      }
    ),
    test(
      'construye Campaign Performance con el mismo contexto efectivo y sin supervisor',
      () => {
        assert.equal(
          buildPortfolioCampaignPerformanceEndpoint(
            '2026-08',
            '2026-08-01',
            '2026-08-13'
          ),
          '/api/v1/portfolio-control-center/campaign-performance?campaign=2026-08&dateFrom=2026-08-01&dateTo=2026-08-13'
        );
      }
    ),
    test(
      'construye Supervisor Performance con el mismo contexto efectivo y filtros atribuibles',
      () => {
        assert.equal(
          buildPortfolioSupervisorPerformanceEndpoint(
            '2026-08',
            '2026-08-05',
            '2026-08-13',
            '29',
            '1'
          ),
          '/api/v1/portfolio-control-center/supervisor-performance?campaign=2026-08&dateFrom=2026-08-05&dateTo=2026-08-13&subPortfolioId=29&supervisorId=1'
        );
      }
    ),
    test(
      'construye Advisor Performance con el contexto efectivo y filtros atribuibles',
      () => {
        assert.equal(
          buildPortfolioAdvisorPerformanceEndpoint(
            '2026-08',
            '2026-08-05',
            '2026-08-13',
            '29',
            '1'
          ),
          '/api/v1/portfolio-control-center/advisor-performance?campaign=2026-08&dateFrom=2026-08-05&dateTo=2026-08-13&subPortfolioId=29&supervisorId=1'
        );
      }
    ),
    test(
      'agrega subPortfolioId a Campaign Performance cuando exista un contexto de subcartera soportado',
      () => {
        assert.equal(
          buildPortfolioCampaignPerformanceEndpoint(
            '2026-08',
            '2026-08-01',
            '2026-08-13',
            '29'
          ),
          '/api/v1/portfolio-control-center/campaign-performance?campaign=2026-08&dateFrom=2026-08-01&dateTo=2026-08-13&subPortfolioId=29'
        );
      }
    ),
    test(
      'mantiene Target Promises y Evolution sin subPortfolioId cuando el scope es campaña',
      () => {
        assert.equal(
          buildPortfolioTargetProgressEndpoint(
            '2026-08',
            '2026-08-13'
          ),
          '/api/v1/portfolio-control-center/target-progress?campaign=2026-08&dateTo=2026-08-13'
        );
        assert.equal(
          buildPortfolioPromisesEndpoint('2026-08'),
          '/api/v1/portfolio-control-center/promises?campaign=2026-08'
        );
        assert.equal(
          buildPortfolioEvolutionEndpoint(
            '2026-08',
            '2026-08-01',
            '2026-08-13'
          ),
          '/api/v1/portfolio-control-center/evolution?campaign=2026-08&dateFrom=2026-08-01&dateTo=2026-08-13'
        );
      }
    ),
    test(
      'no agrega query string cuando Summary usa el contexto por defecto',
      () => {
        assert.equal(
          buildPortfolioSummaryEndpoint({
            dateFrom: null,
            dateTo: null,
            subPortfolioId: null,
            campaignId: null,
            supervisorId: null,
          }),
          '/api/v1/portfolio-control-center/summary'
        );
      }
    ),
  ]
);
