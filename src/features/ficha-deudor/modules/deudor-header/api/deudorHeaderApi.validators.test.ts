import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../../../test/testHarness';
import {
  isCabeceraInfoApi,
  isDeudorInfoApi,
} from './deudorHeaderApi.validators';

const validDeudor = {
  dni: '12345678',
  ruc: '',
  nombre: 'CLIENTE PRUEBA',
  nombreCompleto: 'CLIENTE PRUEBA SAC',
  gradoInstruccion: 'SUPERIOR',
  edad: '35',
  correo: 'cliente@example.com',
  asesorPostVenta: 'APV',
  correoAsesorPostVenta: 'apv@example.com',
  asesorComercial: 'AC',
  correoAsesorComercial: 'ac@example.com',
  clientePorVision: 'SI',
  clienteListaBlanca: 'NO',
  clienteConSinPe: 'CON PE',
};

export const suite = defineSuite('deudorHeaderApi.validators', [
  test('acepta cabecera y deudor con el contrato esperado', () => {
    assert.equal(
      isCabeceraInfoApi({
        ciudad: 'LIMA',
        cCar_Nombre: 'CARTERA',
        cCampanna: '2026-01',
      }),
      true
    );
    assert.equal(isDeudorInfoApi(validDeudor), true);
  }),
  test('rechaza campos obligatorios con null o tipos incompatibles', () => {
    assert.equal(
      isCabeceraInfoApi({
        ciudad: null,
        cCar_Nombre: 'CARTERA',
        cCampanna: '2026-01',
      }),
      false
    );
    assert.equal(isDeudorInfoApi({ ...validDeudor, edad: 35 }), false);
  }),
]);
