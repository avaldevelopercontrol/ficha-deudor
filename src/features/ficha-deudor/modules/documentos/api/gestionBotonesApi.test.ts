import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import { fetchGestionBotones } from './gestionBotonesApi';

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

export const suite = defineSuite('gestionBotonesApi', [
  test('consulta GetGestionBotones por cliente y contrato y mapea la respuesta', async () => {
    const originalFetch = globalThis.fetch;
    const requestCapture: { url: URL | null } = { url: null };

    globalThis.fetch = async (input) => {
      requestCapture.url = getUrlFromRequest(input);

      return new Response(
        JSON.stringify({
          code: '00',
          message: 'OK',
          messageUser: 'OK',
          statusCode: 200,
          pageNumber: 0,
          pageSize: 0,
          totalRecords: 0,
          totalPages: 0,
          response: [
            {
              nId_Boton: 1,
              nId_Cliente: 95,
              nId_Contrato: 182,
              nombreBoton: 'estadoCuenta',
              descripcionBoton: '+ ESTADO CUENTA',
              bEstado: true,
              nCrea: 14931,
              dFechaCrea: '2026-09-11T10:12:00.14',
              nModifica: null,
              dFechaModifica: null,
            },
            {
              nId_Boton: 2,
              nId_Cliente: 95,
              nId_Contrato: 182,
              nombreBoton: 'pagos',
              descripcionBoton: '+ PAGOS',
              bEstado: false,
              nCrea: 14931,
              dFechaCrea: '2026-09-11T10:12:19.997',
              nModifica: null,
              dFechaModifica: null,
            },
          ],
        }),
        {
          status: 200,
          headers: {
            'content-type': 'application/json',
          },
        }
      );
    };

    try {
      const result = await fetchGestionBotones({
        idCliente: '95',
        idContrato: '182',
      });

      assert.ok(requestCapture.url);
      assert.equal(
        requestCapture.url.pathname,
        '/v1/Gestion/GetGestionBotones'
      );
      assert.equal(
        requestCapture.url.searchParams.get('nId_Cliente'),
        '95'
      );
      assert.equal(
        requestCapture.url.searchParams.get('nId_Contrato'),
        '182'
      );
      assert.deepEqual(result, [
        {
          id: 1,
          nombre: 'estadoCuenta',
          label: 'ESTADO CUENTA',
        },
      ]);
    } finally {
      globalThis.fetch = originalFetch;
    }
  }),
]);
