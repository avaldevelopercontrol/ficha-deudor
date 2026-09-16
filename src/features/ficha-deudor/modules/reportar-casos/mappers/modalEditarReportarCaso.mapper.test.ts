import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../../../test/testHarness';
import { mapReportarCasoByIdApiToFormData } from './modalEditarReportarCaso.mapper';

export const suite = defineSuite('modalEditarReportarCaso.mapper', [
  test('carga en el formulario los campos editables del caso', () => {
    const result = mapReportarCasoByIdApiToFormData({
      nId_DocxCobrarOpeResult: 161915,
      nId_DocxCobrar: 238796074,
      dDocCobOpe_FecIni: '2026-09-16T13:33:57.907',
      cDocOpeCobOut_Descr: 'ACTUALIZACION DE CUOTA',
      nId_UsuOpe: 11765,
      nId_PersDeudor: 17524528,
      nId_Cartera: 34359,
      nId_Cliente: 59,
      dDoc_FecActual: '2026-09-16T13:33:57.907',
      cDocParam01: 'Reportar Caso MAF',
      cDocParam04: 'Caso Varios',
    });

    assert.deepEqual(result, {
      caso: 'Reportar Caso MAF',
      descripcion: 'ACTUALIZACION DE CUOTA',
      tipoSiniestro: 'Caso Varios',
    });
  }),
]);
