import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../../../test/testHarness';
import { fetchAgendasByDeudor } from './agendasApi';

const createEnvelope = (response: unknown) => ({
  code: '00',
  message: 'OK',
  messageUser: 'OK',
  statusCode: 200,
  pageNumber: 1,
  pageSize: 1000,
  totalRecords: Array.isArray(response) ? response.length : 0,
  totalPages: 1,
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

export const suite = defineSuite('agendasApi', [
  test('envía los parámetros esperados y propaga AbortSignal', async () => {
    const originalFetch = globalThis.fetch;
    const controller = new AbortController();
    const capturedUrls: URL[] = [];
    let capturedSignal: AbortSignal | null | undefined;

    globalThis.fetch = async (input, init) => {
      capturedUrls.push(getRequestUrl(input));
      capturedSignal = init?.signal;

      return new Response(
        JSON.stringify(createEnvelope([])),
        { status: 200, headers: { 'content-type': 'application/json' } }
      );
    };

    try {
      await fetchAgendasByDeudor(
        {
          idCliente: '95',
          idCartera: '156',
          idDeudor: '3001',
          idUsuario: '16068',
        },
        controller.signal
      );

      const capturedUrl = capturedUrls[0];
      assert.ok(capturedUrl);
      assert.equal(capturedUrl.searchParams.get('nId_Cliente'), '95');
      assert.equal(capturedUrl.searchParams.get('nId_Cartera'), '156');
      assert.equal(capturedUrl.searchParams.get('nId_Persdeudor'), '3001');
      assert.equal(capturedUrl.searchParams.get('nId_PerfilUsuario'), '16068');
      assert.equal(capturedUrl.searchParams.get('PageNumber'), '1');
      assert.equal(capturedUrl.searchParams.get('PageSize'), '1000');
      assert.equal(capturedSignal, controller.signal);
    } finally {
      globalThis.fetch = originalFetch;
    }
  }),
  test('normaliza valores vacíos al fallback visual', async () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () =>
      new Response(
        JSON.stringify(
          createEnvelope([
            {
              nid_agenda: 7,
              fechaNuevaGestion: '2026-08-28T10:30:00',
              tiempoVencido: '',
              cartera: '',
              deudor: '',
              respuestaOEstado: '',
              usuario: '',
            },
          ])
        ),
        { status: 200, headers: { 'content-type': 'application/json' } }
      );

    try {
      const result = await fetchAgendasByDeudor({
        idCliente: '95',
        idCartera: '156',
        idDeudor: '3001',
        idUsuario: '16068',
      });

      assert.deepEqual(result, [
        {
          id: '7',
          fechaNuevaGestion: '2026-08-28T10:30:00',
          tiempoVencido: '—',
          cartera: '—',
          deudor: '—',
          respuestaOEstado: '—',
          usuario: '—',
        },
      ]);
    } finally {
      globalThis.fetch = originalFetch;
    }
  }),
  test('rechaza un registro que no cumple el contrato runtime-safe', async () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () =>
      new Response(
        JSON.stringify(
          createEnvelope([
            {
              nid_agenda: '7',
              fechaNuevaGestion: '2026-08-28T10:30:00',
              tiempoVencido: '',
              cartera: '',
              deudor: '',
              respuestaOEstado: '',
              usuario: '',
            },
          ])
        ),
        { status: 200, headers: { 'content-type': 'application/json' } }
      );

    try {
      await assert.rejects(
        fetchAgendasByDeudor({
          idCliente: '95',
          idCartera: '156',
          idDeudor: '3001',
          idUsuario: '16068',
        }),
        /respuesta del servidor no contiene datos válidos/i
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  }),
]);
