import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import {
  isInfDeudorCabeceraApi,
  isInfDeudorParamApi,
} from './infDeudorApi.validators';

export const suite = defineSuite('infDeudorApi.validators', [
  test('acepta parámetros dinámicos nulos y metadata adicional', () => {
    assert.equal(
      isInfDeudorCabeceraApi({
        bTipo_Cabecera: 0,
        cNombre_Param01: 'DIRECCIÓN',
        cNombre_Param02: null,
        cNombre_Param03: '',
        otroCampoBackend: 123,
      }),
      true
    );
  }),
  test('rechaza una cabecera dinámica con tipo incompatible', () => {
    assert.equal(
      isInfDeudorCabeceraApi({
        cNombre_Param01: 123,
      }),
      false
    );
  }),
  test('acepta valores dinámicos nulos', () => {
    assert.equal(
      isInfDeudorParamApi({
        cPersInf_Param01: 'LIMA',
        cPersInf_Param02: null,
        cPersInf_Param03: '',
      }),
      true
    );
  }),
]);
