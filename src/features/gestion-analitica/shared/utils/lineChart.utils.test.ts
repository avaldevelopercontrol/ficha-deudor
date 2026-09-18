import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../../test/testHarness';
import { buildLineChartModel } from './lineChart.utils';

export const suite = defineSuite('lineChart.utils', [
  test('calcula coordenadas reutilizables para una serie lineal', () => {
    const model = buildLineChartModel([0, 5, 10], {
      width: 100,
      height: 100,
      paddingX: 10,
      paddingY: 10,
    });

    assert.equal(model.maxValue, 10);
    assert.deepEqual(model.coordinates, [
      { x: 10, y: 90, value: 0 },
      { x: 50, y: 50, value: 5 },
      { x: 90, y: 10, value: 10 },
    ]);
    assert.equal(model.polyline, '10,90 50,50 90,10');
  }),

  test('centra una serie de un solo punto y evita dividir entre cero', () => {
    const model = buildLineChartModel([0], {
      width: 80,
      height: 60,
      paddingX: 10,
      paddingY: 10,
    });

    assert.equal(model.maxValue, 1);
    assert.deepEqual(model.coordinates, [
      { x: 40, y: 50, value: 0 },
    ]);
  }),

  test('soporta padding asimétrico y una escala máxima definida por el consumidor', () => {
    const model = buildLineChartModel([25, 50], {
      width: 120,
      height: 100,
      padding: {
        left: 20,
        right: 10,
        top: 10,
        bottom: 20,
      },
      maxValue: 100,
    });

    assert.equal(model.maxValue, 100);
    assert.deepEqual(model.coordinates, [
      { x: 20, y: 62.5, value: 25 },
      { x: 110, y: 45, value: 50 },
    ]);
    assert.equal(model.baselineY, 80);
    assert.ok(model.linePath.startsWith('M '));
    assert.ok(model.areaPath.endsWith(' Z'));
  }),
]);
