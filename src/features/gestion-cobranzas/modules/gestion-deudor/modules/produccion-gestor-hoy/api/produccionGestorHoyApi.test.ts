import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../../../test/testHarness';
import {
  fetchProduccionGestorHoy,
} from './produccionGestorHoyApi';

export const suite = defineSuite(
  'produccionGestorHoyApi',
  [
    test('propaga la señal y envía la identidad normalizada', async () => {
      const originalFetch = globalThis.fetch;
      let capturedUrl = '';
      let capturedSignal:
        AbortSignal | null | undefined;

      globalThis.fetch = async (input, init) => {
        capturedUrl = String(input);
        capturedSignal = init?.signal;

        return new Response(
          JSON.stringify({
            code: 'OK',
            message: '',
            messageUser: '',
            statusCode: 200,
            pageNumber: 1,
            pageSize: 100,
            totalRecords: 0,
            totalPages: 1,
            response: [],
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      };

      try {
        const controller = new AbortController();

        await fetchProduccionGestorHoy(
          {
            idCliente: ' 25 ',
            idUsuario: ' 70 ',
          },
          controller.signal
        );

        assert.equal(capturedSignal, controller.signal);
        assert.match(capturedUrl, /nId_Cliente=25/);
        assert.match(capturedUrl, /nId_Usuario=70/);
      } finally {
        globalThis.fetch = originalFetch;
      }
    }),
    test('rechaza payloads exitosos con filas corruptas', async () => {
      const originalFetch = globalThis.fetch;

      globalThis.fetch = async () =>
        new Response(
          JSON.stringify({
            statusCode: 200,
            response: [{ hora: '09:00' }],
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

      try {
        await assert.rejects(
          () =>
            fetchProduccionGestorHoy({
              idCliente: '25',
              idUsuario: '70',
            }),
          /respuesta del servidor no contiene datos válidos/i
        );
      } finally {
        globalThis.fetch = originalFetch;
      }
    }),
    test('normaliza una respuesta exitosa sin registros a una colección vacía', async () => {
      const originalFetch = globalThis.fetch;

      globalThis.fetch = async () =>
        new Response(
          JSON.stringify({
            statusCode: 200,
            response: null,
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

      try {
        const rows = await fetchProduccionGestorHoy({
          idCliente: '25',
          idUsuario: '70',
        });

        assert.deepEqual(rows, []);
      } finally {
        globalThis.fetch = originalFetch;
      }
    }),
    test('rechaza respuestas exitosas sin la propiedad response', async () => {
      const originalFetch = globalThis.fetch;

      globalThis.fetch = async () =>
        new Response(
          JSON.stringify({
            statusCode: 200,
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

      try {
        await assert.rejects(
          () =>
            fetchProduccionGestorHoy({
              idCliente: '25',
              idUsuario: '70',
            }),
          /respuesta del servidor no contiene datos válidos/i
        );
      } finally {
        globalThis.fetch = originalFetch;
      }
    }),
    test('conserva errores de negocio aunque response no exista', async () => {
      const originalFetch = globalThis.fetch;

      globalThis.fetch = async () =>
        new Response(
          JSON.stringify({
            statusCode: 422,
            messageUser:
              'Usuario sin carteras asignadas.',
          }),
          {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

      try {
        await assert.rejects(
          () =>
            fetchProduccionGestorHoy({
              idCliente: '25',
              idUsuario: '70',
            }),
          /Usuario sin carteras asignadas\./
        );
      } finally {
        globalThis.fetch = originalFetch;
      }
    }),
    test('rechaza identidades inválidas antes de ejecutar fetch', async () => {
      const originalFetch = globalThis.fetch;
      let fetchCalls = 0;

      globalThis.fetch = async () => {
        fetchCalls += 1;
        throw new Error('No debería ejecutarse');
      };

      try {
        await assert.rejects(
          () =>
            fetchProduccionGestorHoy({
              idCliente: '0',
              idUsuario: '70',
            }),
          /cliente y el usuario necesarios/i
        );
        await assert.rejects(
          () =>
            fetchProduccionGestorHoy({
              idCliente: '25',
              idUsuario: 'abc',
            }),
          /cliente y el usuario necesarios/i
        );
        assert.equal(fetchCalls, 0);
      } finally {
        globalThis.fetch = originalFetch;
      }
    }),
  ]
);
