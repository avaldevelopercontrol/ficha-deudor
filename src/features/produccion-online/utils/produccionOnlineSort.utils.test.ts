import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import type {
  ProduccionOnlineRow,
} from '../types/produccionOnline.types';
import {
  sortProduccionOnlineRows,
} from './produccionOnlineSort.utils';

const rows: ProduccionOnlineRow[] = [
  {
    id: 1,
    nombres: 'Uno',
    contactosHora: 4,
    totalContactos: 20,
    totalGestiones: 30,
    cartera: 'A',
  },
  {
    id: 2,
    nombres: 'Dos',
    contactosHora: 9,
    totalContactos: 10,
    totalGestiones: 40,
    cartera: 'B',
  },
  {
    id: 3,
    nombres: 'Tres',
    contactosHora: 4,
    totalContactos: 50,
    totalGestiones: 20,
    cartera: 'C',
  },
];

export const suite = defineSuite(
  'produccionOnlineSort.utils',
  [
    test(
      'mantiene el orden recibido cuando no hay criterio de ordenamiento',
      () => {
        assert.deepEqual(
          sortProduccionOnlineRows(
            rows,
            '',
            'desc'
          ).map((row) => row.id),
          [1, 2, 3]
        );
      }
    ),
    test(
      'ordena Cont. x Hora de mayor a menor conservando empates estables',
      () => {
        assert.deepEqual(
          sortProduccionOnlineRows(
            rows,
            'contactosHora',
            'desc'
          ).map((row) => row.id),
          [2, 1, 3]
        );
      }
    ),
    test(
      'ordena Total Cont. de menor a mayor',
      () => {
        assert.deepEqual(
          sortProduccionOnlineRows(
            rows,
            'totalContactos',
            'asc'
          ).map((row) => row.id),
          [2, 1, 3]
        );
      }
    ),
    test(
      'ordena Total Gest. de mayor a menor',
      () => {
        assert.deepEqual(
          sortProduccionOnlineRows(
            rows,
            'totalGestiones',
            'desc'
          ).map((row) => row.id),
          [2, 1, 3]
        );
      }
    ),
  ]
);
