import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  createUsuarioZona,
  fetchZonasAsignadasByClienteUsuario,
  fetchZonasFaltantesByClienteUsuario,
  updateUsuarioZona,
} from './usuarioZonasApi';

import type {
  UsuarioZonaItem,
} from '../modules/asignar-usuario/types/usuarioZonas.types';

const createJsonResponse = (
  body: unknown,
  status = 200
): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });

const createZona = (
  overrides: Partial<UsuarioZonaItem> = {}
): UsuarioZonaItem => ({
  idAsignacion: null,
  idUsuario: 16068,
  idCliente: 59,
  zona: '550',
  nombre: '550 Lima',
  estado: null,
  ...overrides,
});

const createCollectionResponse = (
  response: unknown
) => ({
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

const createMutationResponse = () => ({
  code: '00',
  message: 'OK',
  messageUser: 'OK',
  statusCode: 200,
  response: {
    nid_asignacion: 901,
    nid_usuario: 16068,
    nid_cliente: 59,
    zona: '550',
  },
});

export const suite = defineSuite(
  'usuarioZonasApi',
  [
    test(
      'consulta zonas faltantes con el cliente activo y el usuario seleccionado',
      async () => {
        const originalFetch =
          globalThis.fetch;
        let capturedUrl = '';

        globalThis.fetch = async (input) => {
          capturedUrl = String(input);

          return createJsonResponse(
            createCollectionResponse([
              {
                zona: '550',
                descripcionZona:
                  '550 Lima                ',
                bEstado: null,
                nid_asignacion: null,
              },
            ])
          );
        };

        try {
          const zonas =
            await fetchZonasFaltantesByClienteUsuario(
              59,
              16068
            );

          const url = new URL(
            capturedUrl
          );

          assert.equal(
            url.pathname,
            '/v1/Usuario/ZonasFaltantesByIdClienteAndIdUsuario'
          );
          assert.equal(
            url.searchParams.get(
              'nId_Cliente'
            ),
            '59'
          );
          assert.equal(
            url.searchParams.get(
              'nId_Usuario'
            ),
            '16068'
          );
          assert.equal(
            zonas[0]?.nombre,
            '550 Lima'
          );
          assert.equal(
            zonas[0]?.estado,
            null
          );
        } finally {
          globalThis.fetch =
            originalFetch;
        }
      }
    ),

    test(
      'consulta zonas asignadas y normaliza su información para la UI',
      async () => {
        const originalFetch =
          globalThis.fetch;

        globalThis.fetch = async () =>
          createJsonResponse(
            createCollectionResponse([
              {
                nid_asignacion: 901,
                nid_usuario: 16068,
                nid_cliente: 59,
                zona: '550',
                bestado: true,
                region: 'Lima',
              },
            ])
          );

        try {
          const zonas =
            await fetchZonasAsignadasByClienteUsuario(
              59,
              16068
            );

          assert.equal(
            zonas[0]?.idAsignacion,
            901
          );
          assert.equal(
            zonas[0]?.nombre,
            '550 Lima'
          );
          assert.equal(
            zonas[0]?.estado,
            true
          );
        } finally {
          globalThis.fetch =
            originalFetch;
        }
      }
    ),

    test(
      'crea una zona nueva mediante POST con bestado=true',
      async () => {
        const originalFetch =
          globalThis.fetch;
        let capturedMethod = '';
        let capturedUrl = '';
        let capturedBody:
          Record<string, unknown> = {};

        globalThis.fetch = async (
          input,
          init
        ) => {
          capturedUrl = String(input);
          capturedMethod =
            init?.method ?? '';
          capturedBody = JSON.parse(
            String(init?.body)
          ) as Record<string, unknown>;

          return createJsonResponse(
            createMutationResponse()
          );
        };

        try {
          await createUsuarioZona(
            createZona()
          );

          assert.equal(
            new URL(capturedUrl).pathname,
            '/v1/Usuario/CreateAsignaUsuario'
          );
          assert.equal(
            capturedMethod,
            'POST'
          );
          assert.deepEqual(
            capturedBody,
            {
              nid_asignacion: 0,
              nid_usuario: 16068,
              nid_cliente: 59,
              zona: '550',
              bestado: true,
            }
          );
        } finally {
          globalThis.fetch =
            originalFetch;
        }
      }
    ),

    test(
      'reactiva mediante PUT usando el nid_asignacion real devuelto por la API',
      async () => {
        const originalFetch =
          globalThis.fetch;
        let capturedMethod = '';
        let capturedBody:
          Record<string, unknown> = {};

        globalThis.fetch = async (
          _input,
          init
        ) => {
          capturedMethod =
            init?.method ?? '';
          capturedBody = JSON.parse(
            String(init?.body)
          ) as Record<string, unknown>;

          return createJsonResponse(
            createMutationResponse()
          );
        };

        try {
          await updateUsuarioZona(
            createZona({
              idAsignacion: 82450,
              zona: '100',
              nombre: '100 Ancash',
              estado: false,
            }),
            true
          );

          assert.equal(
            capturedMethod,
            'PUT'
          );
          assert.equal(
            capturedBody.nid_asignacion,
            82450
          );
          assert.equal(
            capturedBody.zona,
            '100'
          );
          assert.equal(
            capturedBody.bestado,
            true
          );
        } finally {
          globalThis.fetch =
            originalFetch;
        }
      }
    ),

    test(
      'desactiva mediante PUT usando el nid_asignacion real de la zona asignada',
      async () => {
        const originalFetch =
          globalThis.fetch;
        let capturedBody:
          Record<string, unknown> = {};

        globalThis.fetch = async (
          _input,
          init
        ) => {
          capturedBody = JSON.parse(
            String(init?.body)
          ) as Record<string, unknown>;

          return createJsonResponse(
            createMutationResponse()
          );
        };

        try {
          await updateUsuarioZona(
            createZona({
              idAsignacion: 901,
              estado: true,
            }),
            false
          );

          assert.equal(
            capturedBody.nid_asignacion,
            901
          );
          assert.equal(
            capturedBody.zona,
            '550'
          );
          assert.equal(
            capturedBody.bestado,
            false
          );
        } finally {
          globalThis.fetch =
            originalFetch;
        }
      }
    ),

    test(
      'no ejecuta PUT si una relación existente no trae nid_asignacion',
      async () => {
        const originalFetch =
          globalThis.fetch;
        let fetchCalled = false;

        globalThis.fetch = async () => {
          fetchCalled = true;
          return createJsonResponse(
            createMutationResponse()
          );
        };

        try {
          await assert.rejects(
            () =>
              updateUsuarioZona(
                createZona({
                  idAsignacion: null,
                  estado: false,
                }),
                true
              ),
            /nid_asignacion válido/i
          );

          assert.equal(fetchCalled, false);
        } finally {
          globalThis.fetch =
            originalFetch;
        }
      }
    ),

  ]
);
