import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../../../test/testHarness';
import {
  createReportarCaso,
  fetchReportarCasoById,
  fetchReportarCasos,
  updateReportarCaso,
} from './reportarCasosApi';

const createEnvelope = (response: unknown) => ({
  code: '00',
  message: 'OK',
  messageUser: 'OK',
  statusCode: 200,
  pageNumber: 1,
  pageSize: Array.isArray(response) ? response.length : 0,
  totalRecords: Array.isArray(response) ? response.length : 0,
  totalPages: 1,
  response,
});

const createMutationEnvelope = (response: unknown) => ({
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

export const suite = defineSuite('reportarCasosApi', [
  test('usa GetReportarCasos con los tres parámetros esperados y propaga AbortSignal', async () => {
    const originalFetch = globalThis.fetch;
    const controller = new AbortController();
    const capturedUrls: URL[] = [];
    let capturedSignal: AbortSignal | null | undefined;

    globalThis.fetch = async (input, init) => {
      capturedUrls.push(getRequestUrl(input));
      capturedSignal = init?.signal;

      return new Response(JSON.stringify(createEnvelope([])), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    };

    try {
      await fetchReportarCasos(
        {
          idCliente: '95',
          idCartera: '156',
          idDeudor: '3001',
        },
        controller.signal
      );

      const capturedUrl = capturedUrls[0];
      assert.ok(capturedUrl);
      assert.equal(capturedUrl.pathname, '/v1/Boton/GetReportarCasos');
      assert.equal(capturedUrl.searchParams.get('nId_Cliente'), '95');
      assert.equal(capturedUrl.searchParams.get('nId_Cartera'), '156');
      assert.equal(capturedUrl.searchParams.get('nId_PersDeudor'), '3001');
      assert.equal(capturedSignal, controller.signal);
    } finally {
      globalThis.fetch = originalFetch;
    }
  }),
  test('mapea el contrato API al modelo de presentación sin exponer nombres raw', async () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () =>
      new Response(
        JSON.stringify(
          createEnvelope([
            {
              id: 7,
              caso: ' CASO DE PRUEBA ',
              descripcion: ' Detalle del caso ',
              cartera: ' MAF ',
              usuario: ' GESTOR 01 ',
              fec_Ingreso: '2026-09-16T10:30:00',
            },
          ])
        ),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }
      );

    try {
      const result = await fetchReportarCasos({
        idCliente: '95',
        idCartera: '156',
        idDeudor: '3001',
      });

      assert.deepEqual(result, [
        {
          id: '7',
          caso: 'CASO DE PRUEBA',
          descripcion: 'Detalle del caso',
          cartera: 'MAF',
          usuario: 'GESTOR 01',
          fechaIngreso: '2026-09-16T10:30:00',
        },
      ]);
    } finally {
      globalThis.fetch = originalFetch;
    }
  }),
  test('rechaza registros que incumplen el contrato runtime-safe', async () => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async () =>
      new Response(
        JSON.stringify(
          createEnvelope([
            {
              id: '7',
              caso: 'CASO',
              descripcion: 'Detalle',
              cartera: 'MAF',
              usuario: 'GESTOR',
              fec_Ingreso: '2026-09-16T10:30:00',
            },
          ])
        ),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }
      );

    try {
      await assert.rejects(
        fetchReportarCasos({
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
  test('crea un caso mediante CreateReportarCasos con el payload esperado', async () => {
    const originalFetch = globalThis.fetch;
    const controller = new AbortController();
    const capturedUrls: URL[] = [];
    let capturedInit: RequestInit | undefined;

    globalThis.fetch = async (input, init) => {
      capturedUrls.push(getRequestUrl(input));
      capturedInit = init;

      return new Response(
        JSON.stringify(
          createMutationEnvelope({
            nId_DocxCobrarOpeResult: 77,
            nId_Cliente: 95,
            nId_Cartera: 156,
            nId_DocxCobrar: 0,
          })
        ),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }
      );
    };

    try {
      const result = await createReportarCaso(
        {
          idCliente: '95',
          idCartera: '156',
          idDeudor: '3001',
          idUsuario: '15458',
          data: {
            caso: 'Reportar Caso MAF',
            descripcion: 'Detalle del caso',
            tipoSiniestro: 'Caso Varios',
          },
        },
        controller.signal
      );

      const capturedUrl = capturedUrls[0];
      assert.ok(capturedUrl);
      assert.equal(capturedUrl.pathname, '/v1/Boton/CreateReportarCasos');
      assert.equal(capturedInit?.method, 'POST');
      assert.equal(capturedInit?.signal, controller.signal);

      const body = JSON.parse(String(capturedInit?.body));
      assert.equal(body.nId_DocxCobrar, 0);
      assert.equal(body.nId_UsuOpe, 15458);
      assert.equal(body.nId_PersDeudor, 3001);
      assert.equal(body.nId_Cartera, 156);
      assert.equal(body.nId_Cliente, 95);
      assert.equal(body.cDocParam01, 'Reportar Caso MAF');
      assert.equal(body.cDocParam04, 'Caso Varios');
      assert.equal(body.cDocOpeCobOut_Descr, 'Detalle del caso');
      assert.equal(typeof body.dDocCobOpe_FecIni, 'string');
      assert.equal(body.dDocCobOpe_FecIni, body.dDoc_FecActual);

      assert.deepEqual(result, {
        nId_DocxCobrarOpeResult: 77,
        nId_Cliente: 95,
        nId_Cartera: 156,
        nId_DocxCobrar: 0,
      });
    } finally {
      globalThis.fetch = originalFetch;
    }
  }),
  test('obtiene un caso por nId_DocxCobrarOpeResult para editar', async () => {
    const originalFetch = globalThis.fetch;
    const controller = new AbortController();
    const capturedUrls: URL[] = [];
    let capturedSignal: AbortSignal | null | undefined;

    const detail = {
      nId_DocxCobrarOpeResult: 161915,
      nId_DocxCobrar: 238796074,
      dDocCobOpe_FecIni: '2026-09-16T13:33:57.907',
      cDocOpeCobOut_Descr: 'ACTUALIZACION DE CUOTA',
      nId_UsuOpe: 11765,
      nId_PersDeudor: 17524528,
      nId_Cartera: 34359,
      nId_Cliente: 59,
      dDoc_FecActual: '2026-09-16T13:33:57.907',
      cDocParam01: 'Reportar Caso MAF',
      cDocParam04: 'Caso Varios',
    };

    globalThis.fetch = async (input, init) => {
      capturedUrls.push(getRequestUrl(input));
      capturedSignal = init?.signal;

      return new Response(
        JSON.stringify(createMutationEnvelope(detail)),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }
      );
    };

    try {
      const result = await fetchReportarCasoById(
        { idCaso: '161915' },
        controller.signal
      );

      const capturedUrl = capturedUrls[0];
      assert.ok(capturedUrl);
      assert.equal(
        capturedUrl.pathname,
        '/v1/Boton/GetReportarCasos/161915'
      );
      assert.equal(capturedSignal, controller.signal);
      assert.deepEqual(result, detail);
    } finally {
      globalThis.fetch = originalFetch;
    }
  }),
  test('actualiza un caso mediante EditReportarCasos preservando identidad y fecha inicial', async () => {
    const originalFetch = globalThis.fetch;
    const controller = new AbortController();
    const capturedUrls: URL[] = [];
    let capturedInit: RequestInit | undefined;

    const original = {
      nId_DocxCobrarOpeResult: 161915,
      nId_DocxCobrar: 238796074,
      dDocCobOpe_FecIni: '2026-09-16T13:33:57.907',
      cDocOpeCobOut_Descr: 'ACTUALIZACION DE CUOTA',
      nId_UsuOpe: 11765,
      nId_PersDeudor: 17524528,
      nId_Cartera: 34359,
      nId_Cliente: 59,
      dDoc_FecActual: '2026-09-16T13:33:57.907',
      cDocParam01: 'Reportar Caso MAF',
      cDocParam04: 'Caso Varios',
    };

    globalThis.fetch = async (input, init) => {
      capturedUrls.push(getRequestUrl(input));
      capturedInit = init;

      return new Response(
        JSON.stringify(
          createMutationEnvelope({
            nId_DocxCobrarOpeResult: 161915,
            nId_Cliente: 59,
            nId_Cartera: 34359,
            nId_DocxCobrar: 238796074,
          })
        ),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        }
      );
    };

    try {
      await updateReportarCaso(
        {
          idCliente: '59',
          idCartera: '34359',
          idDeudor: '17524528',
          idUsuario: '15458',
          original,
          data: {
            caso: 'Reportar Caso MAF',
            descripcion: ' Descripción actualizada ',
            tipoSiniestro: 'Pago no Reflejado',
          },
        },
        controller.signal
      );

      const capturedUrl = capturedUrls[0];
      assert.ok(capturedUrl);
      assert.equal(capturedUrl.pathname, '/v1/Boton/EditReportarCasos');
      assert.equal(capturedInit?.method, 'PUT');
      assert.equal(capturedInit?.signal, controller.signal);

      const body = JSON.parse(String(capturedInit?.body));
      assert.equal(body.nId_DocxCobrarOpeResult, 161915);
      assert.equal(body.nId_DocxCobrar, 238796074);
      assert.equal(body.dDocCobOpe_FecIni, '2026-09-16T13:33:57.907');
      assert.equal(body.cDocOpeCobOut_Descr, 'Descripción actualizada');
      assert.equal(body.nId_UsuOpe, 15458);
      assert.equal(body.nId_PersDeudor, 17524528);
      assert.equal(body.nId_Cartera, 34359);
      assert.equal(body.nId_Cliente, 59);
      assert.equal(body.cDocParam01, 'Reportar Caso MAF');
      assert.equal(body.cDocParam04, 'Pago no Reflejado');
      assert.equal(typeof body.dDoc_FecActual, 'string');
      assert.notEqual(body.dDoc_FecActual, '');
    } finally {
      globalThis.fetch = originalFetch;
    }
  })
]);
