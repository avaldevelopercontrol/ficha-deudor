import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import {
  calculateBusinessDayProgress,
  calculateExpectedRecoveryAmount,
} from './portfolioTargetCurve.utils';

export const suite = defineSuite(
  'portfolioTargetCurve.utils',
  [
    test(
      'distribuye la meta mensual por días hábiles del mes',
      () => {
        const progress =
          calculateBusinessDayProgress(
            '2026-08-12'
          );

        assert.ok(
          Math.abs(progress - 8 / 21) < 0.000001
        );
        assert.ok(
          Math.abs(
            calculateExpectedRecoveryAmount(
              2_500_000,
              '2026-08-12'
            ) - 952_380.9523809523
          ) < 0.01
        );
      }
    ),
    test(
      'permite descontar feriados configurados',
      () => {
        const progress =
          calculateBusinessDayProgress(
            '2026-08-12',
            ['2026-08-06']
          );

        assert.ok(
          Math.abs(progress - 7 / 20) < 0.000001
        );
      }
    ),
    test(
      'devuelve cero ante una fecha inválida o una meta no positiva',
      () => {
        assert.equal(
          calculateBusinessDayProgress('invalid'),
          0
        );
        assert.equal(
          calculateExpectedRecoveryAmount(
            0,
            '2026-08-12'
          ),
          0
        );
      }
    ),
  ]
);
