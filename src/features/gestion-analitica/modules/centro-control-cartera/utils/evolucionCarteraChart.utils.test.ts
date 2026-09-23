import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import type {
  EvolucionCarteraComparison,
} from '../domain/evolucionCartera.types';
import type {
  EvolucionCarteraPoint,
  PortfolioOperationalContext,
} from '../domain/panoramaCartera.types';
import {
  buildEvolucionCarteraChartModel,
} from './evolucionCarteraChart.utils';

const context: PortfolioOperationalContext = {
  businessUnit: 'ADMINISTRATIVO',
  campaignId: '2026-09',
  dateFrom: '2026-09-10',
  dateTo: '2026-09-12',
  subPortfolioId: null,
};

const evolution: readonly EvolucionCarteraPoint[] = [
  {
    period: '2026-09-10',
    assignedPortfolio: 100,
    managedPortfolio: 40,
    pendingPortfolio: 60,
    recoveredAmount: 120000,
  },
  {
    period: '2026-09-11',
    assignedPortfolio: 100,
    managedPortfolio: 55,
    pendingPortfolio: 45,
    recoveredAmount: 250000,
  },
  {
    period: '2026-09-12',
    assignedPortfolio: 100,
    managedPortfolio: 70,
    pendingPortfolio: 30,
    recoveredAmount: 390000,
  },
];

const comparison: EvolucionCarteraComparison = {
  referenceDateFrom: '2026-09-10',
  referenceDateTo: '2026-09-12',
  comparableProgressMonths: 6,
  comparableRecoveryMonths: 5,
  previousMonth: {
    campaignId: '2026-08',
    campaignName: 'Agosto 2026',
    dateFrom: '2026-08-10',
    dateTo: '2026-08-12',
    coversComparablePeriod: true,
    evolution: [
      {
        period: '2026-08-10',
        assignedPortfolio: 100,
        managedPortfolio: 35,
        pendingPortfolio: 65,
        recoveredAmount: 100000,
      },
      {
        period: '2026-08-12',
        assignedPortfolio: 100,
        managedPortfolio: 60,
        pendingPortfolio: 40,
        recoveredAmount: 320000,
      },
    ],
  },
  bestProgress: {
    campaignId: '2026-07',
    campaignName: 'Julio 2026',
    dateFrom: '2026-07-10',
    dateTo: '2026-07-12',
    coversComparablePeriod: true,
    evolution: [
      {
        period: '2026-07-10',
        assignedPortfolio: 100,
        managedPortfolio: 50,
        pendingPortfolio: 50,
        recoveredAmount: 90000,
      },
      {
        period: '2026-07-12',
        assignedPortfolio: 100,
        managedPortfolio: 82,
        pendingPortfolio: 18,
        recoveredAmount: 280000,
      },
    ],
  },
  bestRecovery: {
    campaignId: '2026-06',
    campaignName: 'Junio 2026',
    dateFrom: '2026-06-10',
    dateTo: '2026-06-12',
    coversComparablePeriod: true,
    evolution: [
      {
        period: '2026-06-10',
        assignedPortfolio: 100,
        managedPortfolio: 30,
        pendingPortfolio: 70,
        recoveredAmount: 200000,
      },
      {
        period: '2026-06-12',
        assignedPortfolio: 100,
        managedPortfolio: 65,
        pendingPortfolio: 35,
        recoveredAmount: 480000,
      },
    ],
  },
};

export const suite = defineSuite(
  'evolucionCarteraChart.utils',
  [
    test(
      'construye avance con mes anterior y mejor avance como referencias distintas',
      () => {
        const model = buildEvolucionCarteraChartModel(
          evolution,
          context,
          comparison,
          'progress'
        );

        assert.equal(model.maxValue, 100);
        assert.equal(model.currentValue, 70);
        assert.equal(model.deltaValue, 30);
        assert.equal(model.comparableMonths, 6);
        assert.equal(model.series.length, 3);
        assert.deepEqual(
          model.series.map((series) => series.campaignId),
          ['2026-09', '2026-08', '2026-07']
        );
        assert.equal(model.xTicks[0]?.day, 1);
        assert.equal(model.xTicks.at(-1)?.day, 3);
      }
    ),
    test(
      'usa un mejor mes independiente para recuperación y una escala común',
      () => {
        const model = buildEvolucionCarteraChartModel(
          evolution,
          context,
          comparison,
          'recovery'
        );

        assert.equal(model.maxValue, 500000);
        assert.equal(model.currentValue, 390000);
        assert.equal(model.deltaValue, 270000);
        assert.equal(model.comparableMonths, 5);
        assert.deepEqual(
          model.series.map((series) => series.campaignId),
          ['2026-09', '2026-08', '2026-06']
        );
      }
    ),
    test(
      'fusiona mes anterior y mejor cuando corresponden a la misma campaña',
      () => {
        const model = buildEvolucionCarteraChartModel(
          evolution,
          context,
          {
            ...comparison,
            bestProgress: comparison.previousMonth,
          },
          'progress'
        );

        assert.equal(model.series.length, 2);
        assert.deepEqual(model.series[1]?.roles, [
          'previous',
          'best',
        ]);
      }
    ),
  ]
);
