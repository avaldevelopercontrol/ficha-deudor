import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import type {
  EvolucionCarteraPoint,
} from '../domain/panoramaCartera.types';
import {
  buildEvolucionCarteraChartModel,
} from './evolucionCarteraChart.utils';

const evolution: readonly EvolucionCarteraPoint[] = [
  {
    period: '2026-08-10',
    assignedPortfolio: 100,
    managedPortfolio: 40,
    pendingPortfolio: 60,
    recoveredAmount: 120000,
  },
  {
    period: '2026-08-11',
    assignedPortfolio: 100,
    managedPortfolio: 55,
    pendingPortfolio: 45,
    recoveredAmount: 250000,
  },
  {
    period: '2026-08-12',
    assignedPortfolio: 100,
    managedPortfolio: 70,
    pendingPortfolio: 30,
    recoveredAmount: 390000,
  },
];

export const suite = defineSuite(
  'evolucionCarteraChart.utils',
  [
    test(
      'construye la serie de avance sobre una escala de 0 a 100',
      () => {
        const model =
          buildEvolucionCarteraChartModel(
            evolution,
            'progress'
          );

        assert.equal(model.maxValue, 100);
        assert.equal(model.currentValue, 70);
        assert.equal(model.deltaValue, 30);
        assert.equal(model.points.length, 3);
        assert.ok(model.linePath.startsWith('M '));
        assert.ok(model.areaPath.endsWith(' Z'));
      }
    ),
    test(
      'redondea el máximo de recuperación para mantener una escala legible',
      () => {
        const model =
          buildEvolucionCarteraChartModel(
            evolution,
            'recovery'
          );

        assert.equal(model.maxValue, 500000);
        assert.equal(model.currentValue, 390000);
        assert.equal(model.deltaValue, 270000);
      }
    ),
    test(
      'devuelve un modelo vacío sin romper el render',
      () => {
        const model =
          buildEvolucionCarteraChartModel(
            [],
            'progress'
          );

        assert.equal(model.points.length, 0);
        assert.equal(model.linePath, '');
        assert.equal(model.currentValue, 0);
      }
    ),
  ]
);
