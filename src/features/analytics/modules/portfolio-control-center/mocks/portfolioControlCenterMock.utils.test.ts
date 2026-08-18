import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import {
  DEFAULT_PORTFOLIO_CONTROL_CENTER_FILTERS,
} from '../constants/portfolioControlCenter.constants';
import {
  buildPortfolioControlCenterMockData,
} from './portfolioControlCenterMock.utils';

export const suite = defineSuite(
  'portfolioControlCenterMock.utils',
  [
    test(
      'filtra el resumen y detalle por campaña',
      () => {
        const result =
          buildPortfolioControlCenterMockData({
            ...DEFAULT_PORTFOLIO_CONTROL_CENTER_FILTERS,
            campaignId: 'campaign-001',
          });

        assert.equal(result.campaigns.length, 1);
        assert.equal(
          result.summary.assignedPortfolio,
          result.campaigns[0].assignedPortfolio
        );
      }
    ),
    test(
      'respeta la relación subcartera campaña supervisor',
      () => {
        const result =
          buildPortfolioControlCenterMockData({
            ...DEFAULT_PORTFOLIO_CONTROL_CENTER_FILTERS,
            subPortfolioId: 'portfolio-001',
            supervisorId: 'supervisor-004',
          });

        assert.equal(result.campaigns.length, 0);
        assert.equal(result.supervisors.length, 0);
        assert.equal(
          result.summary.assignedPortfolio,
          0
        );
      }
    ),
    test(
      'filtra el rango disponible para la evolución',
      () => {
        const result =
          buildPortfolioControlCenterMockData({
            ...DEFAULT_PORTFOLIO_CONTROL_CENTER_FILTERS,
            dateFrom: '2026-08-10',
            dateTo: '2026-08-11',
          });

        assert.deepEqual(
          result.evolution.map(
            (item) => item.period
          ),
          ['2026-08-10', '2026-08-11']
        );
        assert.equal(
          result.updatedAt,
          '2026-08-11T15:45:00-05:00'
        );
        assert.ok(
          result.summary.managedPortfolio <
            78230
        );
      }
    ),
    test(
      'calcula meta, ritmo esperado y compromisos del corte',
      () => {
        const result =
          buildPortfolioControlCenterMockData(
            DEFAULT_PORTFOLIO_CONTROL_CENTER_FILTERS
          );

        assert.ok(result.target);
        assert.equal(
          result.target.monthlyTargetAmount,
          2_500_000
        );
        assert.ok(
          Math.abs(
            result.target.expectedToDateAmount -
              952_380.95
          ) < 0.01
        );
        assert.equal(
          result.promises.dueTodayCount,
          1430
        );
        assert.equal(
          result.attention[0]?.metric,
          'curveGap'
        );
        assert.equal(
          result.attention[1]?.metric,
          'promisesDue'
        );
      }
    ),
    test(
      'filtra asesores por el supervisor seleccionado y evita atribuirle la meta completa de campaña',
      () => {
        const result =
          buildPortfolioControlCenterMockData({
            ...DEFAULT_PORTFOLIO_CONTROL_CENTER_FILTERS,
            supervisorId: 'supervisor-001',
          });

        assert.equal(result.supervisors.length, 1);
        assert.equal(result.advisors.length, 2);
        assert.ok(
          result.advisors.every(
            (item) =>
              item.currentSupervisorId ===
              'supervisor-001'
          )
        );
        assert.equal(result.target, null);
      }
    ),
  ]
);
