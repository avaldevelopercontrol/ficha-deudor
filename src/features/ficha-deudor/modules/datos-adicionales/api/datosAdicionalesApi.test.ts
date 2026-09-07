import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../../../test/testHarness';
import {
  fetchAllDatosAdicionales,
  fetchCabeceraDatosAdicionales,
} from './datosAdicionalesApi';

const createEnvelope = (response: unknown) => ({
  code: '00',
  message: 'OK',
  messageUser: 'OK',
  statusCode: 200,
  pageNumber: 0,
  pageSize: 0,
  totalRecords: 0,
  totalPages: 0,
  response,
});

const getRequestUrl = (input: string | URL | Request) =>
  new URL(
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url
  );

export const suite = defineSuite('datosAdicionalesApi', [
  test('mapea cabecera dinámica y envía cliente/pantalla', async () => {
    const originalFetch = globalThis.fetch;
    const controller = new AbortController();
    const capturedUrls: URL[] = [];
    let capturedSignal: AbortSignal | null | undefined;

    globalThis.fetch = async (input, init) => {
      capturedUrls.push(getRequestUrl(input));
      capturedSignal = init?.signal;

      return new Response(
        JSON.stringify(
          createEnvelope({
            idCab: null,
            documento: 'Documento',
            montoPendiente: 'Monto Pendiente',
            noConfigurado: null,
          })
        ),
        { status: 200, headers: { 'content-type': 'application/json' } }
      );
    };

    try {
      const result = await fetchCabeceraDatosAdicionales(
        { idCliente: '95', pantalla: 2 },
        controller.signal
      );

      const capturedUrl = capturedUrls[0];
      assert.ok(capturedUrl);
      assert.equal(capturedUrl.searchParams.get('nId_Cliente'), '95');
      assert.equal(capturedUrl.searchParams.get('pantalla'), '2');
      assert.equal(capturedSignal, controller.signal);
      assert.deepEqual(result, [
        { key: 'documento', label: 'Documento', type: 'text' },
        { key: 'montoPendiente', label: 'Monto Pendiente', type: 'money' },
      ]);
    } finally {
      globalThis.fetch = originalFetch;
    }
  }),
  test('envía los parámetros de datos y conserva campos dinámicos', async () => {
    const originalFetch = globalThis.fetch;
    const capturedUrls: URL[] = [];

    globalThis.fetch = async (input) => {
      capturedUrls.push(getRequestUrl(input));

      return new Response(
        JSON.stringify(
          createEnvelope([
            {
              nId_DocxCobrarAd: 1,
              nId_DocxCobrar: 2,
              nId_PersDeudor: 3,
              nId_Cartera: 156,
              nId_Cliente: 95,
              referencia: 'ABC-123',
              saldo: 250.5,
            },
          ])
        ),
        { status: 200, headers: { 'content-type': 'application/json' } }
      );
    };

    try {
      const result = await fetchAllDatosAdicionales({
        idCliente: '95',
        idCartera: '156',
        idDeudor: '3',
      });

      const capturedUrl = capturedUrls[0];
      assert.ok(capturedUrl);
      assert.equal(capturedUrl.searchParams.get('nId_Cliente'), '95');
      assert.equal(capturedUrl.searchParams.get('nId_Cartera'), '156');
      assert.equal(capturedUrl.searchParams.get('nId_Persdeudor'), '3');
      assert.equal(capturedUrl.searchParams.get('PageNumber'), '1');
      assert.equal(result[0]?.referencia, 'ABC-123');
      assert.equal(result[0]?.saldo, 250.5);
    } finally {
      globalThis.fetch = originalFetch;
    }
  }),
  test('rechaza un registro dinámico sin identificadores válidos', async () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () =>
      new Response(
        JSON.stringify(
          createEnvelope([
            {
              nId_DocxCobrarAd: 1,
              nId_DocxCobrar: 2,
              nId_PersDeudor: 3,
              nId_Cartera: 156,
              nId_Cliente: null,
            },
          ])
        ),
        { status: 200, headers: { 'content-type': 'application/json' } }
      );

    try {
      await assert.rejects(
        fetchAllDatosAdicionales({
          idCliente: '95',
          idCartera: '156',
          idDeudor: '3',
        }),
        /respuesta del servidor no contiene datos válidos/i
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  }),
]);
