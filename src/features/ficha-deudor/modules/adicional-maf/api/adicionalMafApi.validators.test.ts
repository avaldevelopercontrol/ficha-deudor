import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import { isAdicionalMafApi } from './adicionalMafApi.validators';

const createValidResponse = () => ({
  numeroDiasNoContacto: 4,
  fechaUltimoContacto: '2026-09-17T12:43:04.177',
  cantidadTotalVino: 26,
  cantidadTotalPago: 22,
  cantidadTotalVino6Meses: 2,
  cantidadTotalPago6Meses: 0,
  cobertura: 'MEDIA',
  mejoresGestiones: [
    {
      ventanaMeses: 12,
      canal: 1,
      canalNombre: 'CALL',
      nId_DocxCobrarOpe: 1814811285,
      nId_DocxCobrar: 236569565,
      fecha: '2026-09-03T12:42:24.257',
      estatus: 'TELF OCUPADO',
      peso: 80.5,
      telefono: '948225402',
      comentario: 'OCUPADO',
      intentos: 503,
      intentosRobot: 180,
      contactosDirectos: 0,
      origenDireccion: null,
      direccion: null,
    },
  ],
  operaciones: [
    {
      operacion: '84011',
      placa: 'M5M372',
      diasAtraso: 62,
      nId_Ubigeo: 1346,
      estadoOperacion: 'Normal',
      avanceCredito: 'Tramo Final',
      direccionLegal: 'CALLE MIGUEL GRAU NUMERO 751',
      distritoLegal: 'MONSEFU',
      provinciaLegal: 'CHICLAYO',
      departamentoLegal: 'Lambayeque',
    },
  ],
});

export const suite = defineSuite('adicionalMafApi.validators', [
  test('acepta la respuesta documentada por GetOperativasMaf', () => {
    assert.equal(isAdicionalMafApi(createValidResponse()), true);
  }),
  test('tolera valores opcionales nulos y colecciones vacías', () => {
    assert.equal(
      isAdicionalMafApi({
        ...createValidResponse(),
        fechaUltimoContacto: null,
        cobertura: null,
        mejoresGestiones: [],
        operaciones: [],
      }),
      true
    );
  }),
  test('rechaza contadores negativos o colecciones con estructura inválida', () => {
    assert.equal(
      isAdicionalMafApi({
        ...createValidResponse(),
        cantidadTotalPago: -1,
      }),
      false
    );

    assert.equal(
      isAdicionalMafApi({
        ...createValidResponse(),
        mejoresGestiones: [{ canal: 1 }],
      }),
      false
    );
  }),
]);
