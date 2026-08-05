import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../test/testHarness';

import {
  formatDateTimeInPeru,
  getCurrentPeruDateTime,
} from './peruDateTime.utils';

export const suite = defineSuite(
  'peruDateTime.utils',
  [
    test(
      'convierte UTC a la hora reloj de Perú sin agregar zona horaria',
      () => {
        assert.equal(
          formatDateTimeInPeru(
            new Date(
              '2026-08-05T16:18:55.053Z'
            )
          ),
          '2026-08-05T11:18:55.053'
        );
      }
    ),
    test(
      'mantiene los milisegundos al generar la fecha actual de Perú',
      () => {
        assert.equal(
          getCurrentPeruDateTime(
            new Date(
              '2026-08-05T15:50:12.823Z'
            )
          ),
          '2026-08-05T10:50:12.823'
        );
      }
    ),
    test(
      'rechaza fechas inválidas',
      () => {
        assert.throws(
          () =>
            formatDateTimeInPeru(
              new Date('invalid')
            ),
          /fecha inválida/
        );
      }
    ),
  ]
);
