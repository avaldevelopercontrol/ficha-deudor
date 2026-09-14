import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import {
  formatSesionesBiDuration,
  peruDateStartToUtcIso,
  resolveSesionesBiPeriod,
} from './sesionesBi.utils';

export const suite = defineSuite(
  'sesionesBi.utils',
  [
    test(
      'convierte el inicio de un día de Perú al corte UTC equivalente',
      () => {
        assert.equal(
          peruDateStartToUtcIso('2026-09-14'),
          '2026-09-14T05:00:00.000Z'
        );
      }
    ),
    test(
      'construye últimos siete días con límite superior exclusivo',
      () => {
        const range = resolveSesionesBiPeriod(
          'LAST_7_DAYS',
          new Date('2026-09-14T18:00:00.000Z')
        );

        assert.deepEqual(range, {
          fromDate: '2026-09-08',
          toDate: '2026-09-14',
          fromUtc: '2026-09-08T05:00:00.000Z',
          toUtc: '2026-09-15T05:00:00.000Z',
        });
      }
    ),
    test(
      'formatea duraciones sin inflar segundos a minutos',
      () => {
        assert.equal(formatSesionesBiDuration(23), '23s');
        assert.equal(formatSesionesBiDuration(125), '2m 5s');
        assert.equal(formatSesionesBiDuration(7_500), '2h 5m');
      }
    ),
  ]
);
