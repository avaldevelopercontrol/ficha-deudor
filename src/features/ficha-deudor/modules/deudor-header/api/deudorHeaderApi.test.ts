import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../../../test/testHarness';
import {
  fetchCabeceraHeader,
  fetchDeudorHeader,
} from './deudorHeaderApi';

const createEnvelope = (response: unknown) => ({
  code: '00',
  message: 'OK',
  messageUser: 'OK',
  statusCode: 200,
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

const deudorApi = {
  dni: '12345678',
  ruc: '',
  nombre: 'CLIENTE PRUEBA',
  nombreCompleto: '',
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

export const suite = defineSuite('deudorHeaderApi', [
  test('mapea zona/cartera/campaña y envía sus query params', async () => {
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
            ciudad: 'LIMA',
            cCar_Nombre: 'CLARO 2026',
            cCampanna: 'AGOSTO',
          })
        ),
        { status: 200, headers: { 'content-type': 'application/json' } }
      );
    };

    try {
      const result = await fetchCabeceraHeader(
        { idCliente: '95', idCartera: '156' },
        controller.signal
      );

      assert.deepEqual(result, {
        zona: 'LIMA',
        cartera: 'CLARO 2026',
        campana: 'AGOSTO',
      });
      const capturedUrl = capturedUrls[0];
      assert.ok(capturedUrl);
      assert.equal(capturedUrl.searchParams.get('nId_Cliente'), '95');
      assert.equal(capturedUrl.searchParams.get('nId_Cartera'), '156');
      assert.equal(capturedSignal, controller.signal);
    } finally {
      globalThis.fetch = originalFetch;
    }
  }),
  test('construye nombre y DNI cuando nombreCompleto/RUC están vacíos', async () => {
    const originalFetch = globalThis.fetch;
    const capturedUrls: URL[] = [];

    globalThis.fetch = async (input) => {
      capturedUrls.push(getRequestUrl(input));
      return new Response(
        JSON.stringify(createEnvelope(deudorApi)),
        { status: 200, headers: { 'content-type': 'application/json' } }
      );
    };

    try {
      const result = await fetchDeudorHeader({
        idCliente: '95',
        idCartera: '156',
        idDeudor: '3001',
      });

      assert.equal(result.nombreRazonSocial, 'CLIENTE PRUEBA');
      assert.equal(result.dniRuc, '12345678');
      assert.equal(result.contacto, 'cliente@example.com');
      const capturedUrl = capturedUrls[0];
      assert.ok(capturedUrl);
      assert.equal(capturedUrl.searchParams.get('nId_Persdeudor'), '3001');
    } finally {
      globalThis.fetch = originalFetch;
    }
  }),
  test('rechaza un deudor con contrato runtime inválido', async () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () =>
      new Response(
        JSON.stringify(createEnvelope({ ...deudorApi, edad: null })),
        { status: 200, headers: { 'content-type': 'application/json' } }
      );

    try {
      await assert.rejects(
        fetchDeudorHeader({
          idCliente: '95',
          idCartera: '156',
          idDeudor: '3001',
        }),
        /respuesta del servidor no contiene datos válidos/i
      );
    } finally {
      globalThis.fetch = originalFetch;
    }
  }),
]);
