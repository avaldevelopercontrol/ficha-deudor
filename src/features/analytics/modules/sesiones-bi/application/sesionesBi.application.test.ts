import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import {
  getSesionBiDetailResourceKey,
  getSesionesBiPanelResourceKey,
} from './sesionesBi.application';

export const suite = defineSuite(
  'sesionesBi.application',
  [
    test(
      'construye resource keys con todos los filtros que cambian el panel',
      () => {
        assert.deepEqual(
          getSesionesBiPanelResourceKey({
            fromUtc: 'from',
            toUtc: 'to',
            reportId: 1,
            userId: 2,
            clientId: 3,
            status: 'ACTIVA',
            order: 'inicio_desc',
            page: 4,
            pageSize: 20,
          }),
          [
            'from',
            'to',
            1,
            2,
            3,
            'ACTIVA',
            'inicio_desc',
            4,
            20,
          ]
        );
      }
    ),
    test(
      'la resource key del detalle representa también el estado sin selección',
      () => {
        assert.deepEqual(getSesionBiDetailResourceKey(null), [null]);
        assert.deepEqual(getSesionBiDetailResourceKey('abc'), ['abc']);
      }
    ),
  ]
);
