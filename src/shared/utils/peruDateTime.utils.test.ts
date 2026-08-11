import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../test/testHarness';

import {
  formatDateTimeInPeru,
  getCurrentPeruDateTime,
  normalizePeruApiDateTime,
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
    test(
      'normaliza fechas SQL de la API para contratos de escritura',
      () => {
        assert.equal(
          normalizePeruApiDateTime(
            '2026-08-11 11:26:24'
          ),
          '2026-08-11T11:26:24.000'
        );
        assert.equal(
          normalizePeruApiDateTime(
            '2026-08-11 11:26:24.297'
          ),
          '2026-08-11T11:26:24.297'
        );
        assert.equal(
          normalizePeruApiDateTime(
            '2026-08-11T11:26:24.2'
          ),
          '2026-08-11T11:26:24.200'
        );
      }
    ),
    test(
      'rechaza fechas locales inválidas al normalizar para la API',
      () => {
        assert.throws(
          () =>
            normalizePeruApiDateTime(
              '2026-02-30 11:26:24',
              'dFechaCrea'
            ),
          /dFechaCrea.*válida/i
        );
      }
    ),
  ]
);
