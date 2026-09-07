import assert from 'node:assert/strict';

import { ApiError } from '@shared/api/apiClient';
import { defineSuite, test } from '../../../../../test/testHarness';
import { exportGestionEstadoCuenta } from './estadoCuentaApi';

const getRequestUrl = (input: string | URL | Request) =>
  new URL(
    typeof input === 'string'
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url
  );

export const suite = defineSuite('estadoCuentaApi', [
  test('envía parámetros, Accept de Excel y AbortSignal', async () => {
    const originalFetch = globalThis.fetch;
    const controller = new AbortController();
    const capturedUrls: URL[] = [];
    let capturedSignal: AbortSignal | null | undefined;
    let capturedHeaders: HeadersInit | undefined;

    globalThis.fetch = async (input, init) => {
      capturedUrls.push(getRequestUrl(input));
      capturedSignal = init?.signal;
      capturedHeaders = init?.headers;

      return new Response(new Blob(['excel-data']), {
        status: 200,
        headers: {
          'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'content-disposition': 'attachment; filename="EstadoCuenta.xlsx"',
        },
      });
    };

    try {
      const result = await exportGestionEstadoCuenta(
        {
          idCliente: '95',
          idCartera: '156',
          idDeudor: '3001',
        },
        controller.signal
      );

      const capturedUrl = capturedUrls[0];
      assert.ok(capturedUrl);
      assert.equal(capturedUrl.searchParams.get('nId_Cliente'), '95');
      assert.equal(capturedUrl.searchParams.get('nId_Cartera'), '156');
      assert.equal(capturedUrl.searchParams.get('nId_Persdeudor'), '3001');
      assert.equal(capturedUrl.searchParams.get('PageNumber'), '1');
      assert.equal(capturedUrl.searchParams.get('PageSize'), '1000');
      assert.equal(capturedSignal, controller.signal);
      assert.equal(
        new Headers(capturedHeaders).get('Accept'),
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      assert.equal(result.fileName, 'EstadoCuenta.xlsx');
      assert.equal(result.blob.size > 0, true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  }),
  test('interpreta una respuesta JSON 200 como error de negocio', async () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () =>
      new Response(
        JSON.stringify({ messageUser: 'No existen datos para exportar.' }),
        { status: 200, headers: { 'content-type': 'application/json' } }
      );

    try {
      await assert.rejects(
        exportGestionEstadoCuenta({
          idCliente: '95',
          idCartera: '156',
          idDeudor: '3001',
        }),
        (error: unknown) =>
          error instanceof ApiError &&
          /No existen datos para exportar/.test(error.message)
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  }),
  test('rechaza archivos vacíos aunque HTTP responda 200', async () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () =>
      new Response(new Blob([]), {
        status: 200,
        headers: {
          'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });

    try {
      await assert.rejects(
        exportGestionEstadoCuenta({
          idCliente: '95',
          idCartera: '156',
          idDeudor: '3001',
        }),
        /archivo vacío/i
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  }),
]);
