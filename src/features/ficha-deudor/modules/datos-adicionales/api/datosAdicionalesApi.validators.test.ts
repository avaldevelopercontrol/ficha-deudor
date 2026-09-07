import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../../../test/testHarness';
import {
  isCabeceraDatosAdicionalesApi,
  isDatoAdicionalApi,
} from './datosAdicionalesApi.validators';

export const suite = defineSuite('datosAdicionalesApi.validators', [
  test('acepta cabeceras dinámicas con idCab nulo u omitido', () => {
    assert.equal(
      isCabeceraDatosAdicionalesApi({ idCab: null, monto: 'Monto', campo: null }),
      true
    );
    assert.equal(
      isCabeceraDatosAdicionalesApi({ monto: 'Monto' }),
      true
    );
  }),
  test('rechaza idCab con un tipo incompatible', () => {
    assert.equal(
      isCabeceraDatosAdicionalesApi({ idCab: '10', monto: 'Monto' }),
      false
    );
  }),
  test('valida únicamente los identificadores estructurales del registro dinámico', () => {
    const valid = {
      nId_DocxCobrarAd: 1,
      nId_DocxCobrar: 2,
      nId_PersDeudor: 3,
      nId_Cartera: 4,
      nId_Cliente: 5,
      campoDinamico: null,
    };

    assert.equal(isDatoAdicionalApi(valid), true);
    assert.equal(isDatoAdicionalApi({ ...valid, nId_Cliente: '5' }), false);
  }),
]);
