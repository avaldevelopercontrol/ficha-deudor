import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import type {
  PortfolioPromiseStatus,
  PortfolioTargetProgress,
} from '../../../types/portfolioControlCenter.types';
import {
  buildPortfolioOperationalAttention,
} from './portfolioAttention.utils';

const TARGET: PortfolioTargetProgress = {
  monthlyTargetAmount: 17_140_742,
  expectedToDateAmount: 7_713_333.9,
  targetAchievementRate: 15.5646,
  paceAchievementRate: 34.5882,
  gapAmount: -5_045_429.0014,
  gapRate: -65.4118,
};

const PROMISES: PortfolioPromiseStatus = {
  dueTodayCount: 7,
  dueTodayAmount: 14500,
  overdueCount: 3,
  fulfillmentRate: 62.5,
};

export const suite = defineSuite(
  'portfolioAttention.utils',
  [
    test(
      'deriva señales operativas solo desde métricas canonical disponibles',
      () => {
        const result = buildPortfolioOperationalAttention(
          TARGET,
          PROMISES
        );

        assert.deepEqual(
          result.map((item) => item.metric),
          ['curveGap', 'promisesOverdue', 'promisesDue']
        );
        assert.equal(result[0]?.tone, 'critical');
        assert.equal(result[1]?.value, 3);
        assert.equal(result[2]?.amount, 14500);
      }
    ),
    test(
      'no inventa una señal de curva cuando gapRate no es evaluable',
      () => {
        const result = buildPortfolioOperationalAttention(
          {
            ...TARGET,
            gapRate: null,
          },
          {
            dueTodayCount: 0,
            dueTodayAmount: 0,
            overdueCount: 0,
            fulfillmentRate: null,
          }
        );

        assert.deepEqual(result, []);
      }
    ),
  ]
);
