import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import { fetchAdicionalMaf } from './adicionalMafApi';

const getUrlFromRequest = (
  input: string | URL | Request
): URL => {
  const rawUrl =
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;

  return new URL(rawUrl, 'http://localhost');
};

const apiResponse = {
  code: '00',
  message: 'OK',
  messageUser: 'OK',
  statusCode: 200,
  response: {
    numeroDiasNoContacto: 4,
    fechaUltimoContacto: ' 2026-09-17T12:43:04.177 ',
    cantidadTotalVino: 26,
    cantidadTotalPago: 22,
    cantidadTotalVino6Meses: 2,
    cantidadTotalPago6Meses: 0,
    cobertura: ' MEDIA ',
    mejoresGestiones: [
      {
        ventanaMeses: 12,
        canal: 1,
        canalNombre: ' CALL ',
        nId_DocxCobrarOpe: 1814811285,
        nId_DocxCobrar: 236569565,
        fecha: ' 2026-09-03T12:42:24.257 ',
        estatus: ' TELF OCUPADO ',
        peso: 80,
        telefono: ' 948225402 ',
        comentario: ' OCUPADO ',
        intentos: 503,
        intentosRobot: 180,
        contactosDirectos: 0,
        origenDireccion: null,
        direccion: null,
      },
    ],
    operaciones: [
      {
        operacion: ' 84011 ',
        placa: ' M5M372 ',
        diasAtraso: 62,
        nId_Ubigeo: 1346,
        estadoOperacion: ' Normal ',
        avanceCredito: ' Tramo Final ',
        direccionLegal: ' CALLE MIGUEL GRAU NUMERO 751 ',
        distritoLegal: ' MONSEFU ',
        provinciaLegal: ' CHICLAYO ',
        departamentoLegal: ' Lambayeque ',
      },
    ],
  },
};

export const suite = defineSuite('adicionalMafApi', [
  test('consulta GetOperativasMaf con los tres identificadores requeridos', async () => {
    const originalFetch = globalThis.fetch;
    const requestCapture: { url: URL | null } = { url: null };

    globalThis.fetch = async (input) => {
      requestCapture.url = getUrlFromRequest(input);

      return new Response(JSON.stringify(apiResponse), {
        status: 200,
        headers: {
          'content-type': 'application/json',
        },
      });
    };

    try {
      const result = await fetchAdicionalMaf({
        idDeudor: '3607007',
        idCartera: '34374',
        idCliente: '59',
      });

      assert.ok(requestCapture.url);
      assert.equal(
        requestCapture.url.pathname,
        '/v1/Boton/GetOperativasMaf'
      );
      assert.equal(
        requestCapture.url.searchParams.get('nId_PersDeudor'),
        '3607007'
      );
      assert.equal(
        requestCapture.url.searchParams.get('nId_Cartera'),
        '34374'
      );
      assert.equal(
        requestCapture.url.searchParams.get('nId_Cliente'),
        '59'
      );

      assert.equal(result.cobertura, 'MEDIA');
      assert.equal(result.mejoresGestiones[0]?.canalNombre, 'CALL');
      assert.equal(result.mejoresGestiones[0]?.telefono, '948225402');
      assert.equal(result.operaciones[0]?.operacion, '84011');
      assert.equal(result.operaciones[0]?.placa, 'M5M372');
    } finally {
      globalThis.fetch = originalFetch;
    }
  }),
  test('rechaza un envelope exitoso cuyo response no cumple el contrato', async () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({
          ...apiResponse,
          response: {
            ...apiResponse.response,
            operaciones: 'invalido',
          },
        }),
        {
          status: 200,
          headers: {
            'content-type': 'application/json',
          },
        }
      );

    try {
      await assert.rejects(
        () =>
          fetchAdicionalMaf({
            idDeudor: '3607007',
            idCartera: '34374',
            idCliente: '59',
          }),
        /respuesta del servidor no contiene datos válidos/i
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  }),
]);
