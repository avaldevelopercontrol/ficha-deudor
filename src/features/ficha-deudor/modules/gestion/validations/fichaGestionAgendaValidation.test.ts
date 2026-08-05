import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../../../test/testHarness';
import { createGestionForm, NP1_OPTIONS, NP2_OPTIONS, NP2_SIN_DATO_OPTIONS } from '../../../../../test/factories/fichaGestion.factory';
import { isSinDatoOption, normalizePaletaLabel, validateFichaGestionAgenda } from './fichaGestionAgendaValidation';

const now = new Date('2026-08-04T14:17:00.000Z');

export const suite = defineSuite('validateFichaGestionAgenda', [
  test('acepta una agenda futura con NP2 real', () => {
    const errors = validateFichaGestionAgenda({
      form: createGestionForm({ fechaNuevaGestion: '2026-08-04', horaNuevaGestion: '10:00' }),
      np1Options: NP1_OPTIONS, np2Options: NP2_OPTIONS, now,
    });
    assert.deepEqual(errors, {});
  }),
  test('rechaza una fecha pasada o igual a la actual', () => {
    const errors = validateFichaGestionAgenda({
      form: createGestionForm({ fechaNuevaGestion: '2026-08-04', horaNuevaGestion: '09:17' }),
      np1Options: NP1_OPTIONS, np2Options: NP2_OPTIONS, now,
    });
    assert.ok(errors.fechaNuevaGestion);
  }),
  test('permite NP2 SIN DATO cuando no existen opciones reales', () => {
    const errors = validateFichaGestionAgenda({
      form: createGestionForm({ np2: '0', fechaNuevaGestion: '2026-08-04', horaNuevaGestion: '10:00' }),
      np1Options: NP1_OPTIONS, np2Options: NP2_SIN_DATO_OPTIONS, now,
    });
    assert.equal(errors.np2, undefined);
  }),
  test('normaliza correctamente la etiqueta SIN DATO', () => {
    assert.equal(normalizePaletaLabel(' sin dato (0) '), 'SIN DATO');
    assert.equal(isSinDatoOption(NP2_SIN_DATO_OPTIONS[0]), true);
  }),
]);
