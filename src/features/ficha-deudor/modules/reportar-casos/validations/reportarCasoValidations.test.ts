import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../../../test/testHarness';
import {
  hasRequiredReportarCasoSelections,
  validateReportarCasoForm,
} from './reportarCasoValidations';

export const suite = defineSuite('reportarCasoValidations', [
  test('exige caso, descripción y tipo de siniestro', () => {
    assert.deepEqual(
      validateReportarCasoForm({
        caso: '',
        descripcion: '   ',
        tipoSiniestro: '',
      }),
      {
        caso: 'Debe seleccionar el caso a reportar',
        descripcion: 'La descripción es obligatoria',
        tipoSiniestro: 'Debe seleccionar el tipo de siniestro',
      }
    );
  }),
  test('acepta el formulario completo', () => {
    assert.deepEqual(
      validateReportarCasoForm({
        caso: 'Reportar Caso MAF',
        descripcion: 'Detalle del caso',
        tipoSiniestro: 'Caso Varios',
      }),
      {}
    );
  }),
  test('habilita el registro solo cuando ambos menús obligatorios tienen valor', () => {
    assert.equal(
      hasRequiredReportarCasoSelections({
        caso: 'Reportar Caso MAF',
        tipoSiniestro: '',
      }),
      false
    );

    assert.equal(
      hasRequiredReportarCasoSelections({
        caso: '',
        tipoSiniestro: 'Caso Varios',
      }),
      false
    );

    assert.equal(
      hasRequiredReportarCasoSelections({
        caso: 'Reportar Caso MAF',
        tipoSiniestro: 'Caso Varios',
      }),
      true
    );
  }),
  test('rechaza valores que no pertenecen a los catálogos permitidos', () => {
    assert.deepEqual(
      validateReportarCasoForm({
        caso: 'Otro caso',
        descripcion: 'Detalle',
        tipoSiniestro: 'Tipo desconocido',
      }),
      {
        caso: 'Debe seleccionar el caso a reportar',
        tipoSiniestro: 'Debe seleccionar el tipo de siniestro',
      }
    );

    assert.equal(
      hasRequiredReportarCasoSelections({
        caso: 'Reportar Caso MAF',
        tipoSiniestro: 'Tipo desconocido',
      }),
      false
    );
  })
]);
