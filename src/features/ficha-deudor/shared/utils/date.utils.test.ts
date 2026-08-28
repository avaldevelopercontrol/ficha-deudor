import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../../test/testHarness';
import {
  buildPeruApiDateTime,
  buildTimeValue,
  formatDateTimeInPeru,
  getCurrentPeruDateTime,
  normalizeDateValue,
  parsePeruDateTime,
  splitTime,
  toPeruApiDateTimeOrNull,
  toPeruApiDateTimeOrCurrent,
  toRequiredPeruApiDateTime,
} from './date.utils';

export const suite = defineSuite('date.utils', [
  test('convierte una fecha absoluta a la hora local de Perú', () => {
    assert.equal(
      formatDateTimeInPeru(new Date('2026-08-04T14:17:32.456Z')),
      '2026-08-04T09:17:32.456'
    );
  }),
  test('rechaza fechas inválidas', () => {
    assert.throws(
      () => formatDateTimeInPeru(new Date('invalid')),
      /fecha inválida/
    );
  }),
  test('normaliza fechas de pantalla y API conservando su precisión', () => {
    assert.equal(normalizeDateValue('04/08/2026'), '2026-08-04');
    assert.equal(
      normalizeDateValue('2026-08-04 09:15:00'),
      '2026-08-04T09:15:00'
    );
    assert.equal(
      toPeruApiDateTimeOrNull('2026-08-04'),
      '2026-08-04T00:00:00'
    );
    assert.equal(
      toPeruApiDateTimeOrNull('2026-08-04T09:15:00.1'),
      '2026-08-04T09:15:00.100'
    );
    assert.equal(toPeruApiDateTimeOrNull('  '), null);
  }),
  test('rechaza fechas calendario y horas imposibles', () => {
    assert.equal(
      toPeruApiDateTimeOrNull('2026-02-30'),
      null
    );
    assert.equal(
      toPeruApiDateTimeOrNull('2026-08-04T24:00:00'),
      null
    );
    assert.equal(
      toPeruApiDateTimeOrNull('fecha inválida'),
      null
    );
    assert.equal(
      toPeruApiDateTimeOrNull('2026-02-30T10:00:00.000Z'),
      null
    );
  }),
  test('convierte fechas con zona explícita a hora reloj de Perú', () => {
    assert.equal(
      toRequiredPeruApiDateTime('2026-08-04T14:17:32.000Z', 'fecha'),
      '2026-08-04T09:17:32.000'
    );
    assert.equal(
      toRequiredPeruApiDateTime('2026-08-04T11:17:32.000-03:00', 'fecha'),
      '2026-08-04T09:17:32.000'
    );
  }),
  test('genera la fecha actual de API en hora de Perú', () => {
    assert.equal(
      getCurrentPeruDateTime(
        new Date('2026-08-04T14:17:32.456Z')
      ),
      '2026-08-04T09:17:32.456'
    );
  }),
  test('combina y compara fecha y hora como hora reloj de Perú', () => {
    assert.equal(
      buildPeruApiDateTime('2026-08-04', '09:17'),
      '2026-08-04T09:17:00.000'
    );

    assert.equal(
      parsePeruDateTime(
        '2026-08-04',
        '09:17'
      )?.toISOString(),
      '2026-08-04T14:17:00.000Z'
    );

    assert.equal(
      parsePeruDateTime(
        '2026-02-30',
        '09:17'
      ),
      null
    );
  }),
  test('usa la fecha actual de Perú solo cuando el valor recibido es inválido', () => {
    const currentDate = new Date(
      '2026-08-04T14:17:32.456Z'
    );

    assert.equal(
      toPeruApiDateTimeOrCurrent(
        '2026-08-01T10:00:00.000Z',
        currentDate
      ),
      '2026-08-01T05:00:00.000'
    );

    assert.equal(
      toPeruApiDateTimeOrCurrent(
        'fecha inválida',
        currentDate
      ),
      '2026-08-04T09:17:32.456'
    );
  }),
  test('separa y reconstruye horas sin perder el otro componente', () => {
    assert.deepEqual(splitTime('14:35'), { hour: '14', minute: '35' });
    assert.equal(buildTimeValue('14:35', 'hour', '09'), '09:35');
    assert.equal(buildTimeValue('14:35', 'minute', '05'), '14:05');
  }),
]);
