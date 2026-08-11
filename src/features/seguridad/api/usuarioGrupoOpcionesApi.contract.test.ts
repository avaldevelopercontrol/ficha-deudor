import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import type {
  UsuarioGrupoOpcionDetalle,
} from '../types/usuarioGrupoOpcion.types';

import {
  addUsuarioGrupoOpciones,
  fetchUsuarioGrupoOpcionById,
  fetchUsuarioGrupoOpcionesByUsuarioGrupo,
} from './usuarioGrupoOpcionesApi';

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

const listadoItem = (
  overrides: Record<string, unknown> = {}
) => ({
  nId_UsuarioGrupoOpcion: 1,
  nId_Usuario: 14931,
  cUsr_NroDoc: '42287423',
  cUsr_ApePat: 'Martinez',
  cUsr_ApeMat: 'Zapana',
  cUsr_Nombres: 'Luis Pierre',
  cUsr_Login: '14931',
  nId_Grupo: 156,
  cNombre_Grupo: 'CLARO CORPORATIVO',
  nId_Opcion: 10,
  sCodigoOpcion: 'mMantenerPerfil',
  sNombreOpcion: 'Mantener perfil',
  bConsultar: true,
  bInsertar: null,
  bEditar: false,
  bEliminar: null,
  bExportar: null,
  bEstado: true,
  nCrea: 100,
  dFechaCrea: '2026-08-10 12:56:48',
  nModifica: null,
  dFechaModifica: null,
  ...overrides,
});

const existing = (
  overrides: Partial<UsuarioGrupoOpcionDetalle> = {}
): UsuarioGrupoOpcionDetalle => ({
  idUsuarioGrupoOpcion: 1,
  idUsuario: 14931,
  idGrupo: 156,
  idOpcion: 10,
  consultar: true,
  insertar: false,
  editar: false,
  eliminar: false,
  exportar: false,
  estadoActivo: false,
  crea: 100,
  fechaCrea: '2026-08-10T12:56:48.000',
  ...overrides,
});

export const suite = defineSuite(
  'usuarioGrupoOpcionesApi contrato',
  [
    test(
      'consulta solo los accesos especiales del usuario y grupo seleccionados',
      async () => {
        const originalFetch = globalThis.fetch;
        let capturedUrl = '';
        let capturedSignal: AbortSignal | null | undefined;
        const controller = new AbortController();

        globalThis.fetch = async (input, init) => {
          capturedUrl = String(input);
          capturedSignal = init?.signal;

          return createJsonResponse({
            code: '00',
            message: 'OK',
            messageUser: 'OK',
            statusCode: 200,
            pageNumber: 1,
            pageSize: 1000,
            totalRecords: 1,
            totalPages: 1,
            response: [listadoItem()],
          });
        };

        try {
          const result =
            await fetchUsuarioGrupoOpcionesByUsuarioGrupo(
              14931,
              156,
              controller.signal
            );
          const url = new URL(capturedUrl);

          assert.match(
            url.pathname,
            /\/v1\/UsuarioGrupoOpcion\/GetByIdUsuarioIdGrupo$/
          );
          assert.equal(
            url.searchParams.get('nId_Usuario'),
            '14931'
          );
          assert.equal(
            url.searchParams.get('nId_Grupo'),
            '156'
          );
          assert.equal(
            url.searchParams.get('PageNumber'),
            '1'
          );
          assert.equal(
            url.searchParams.get('PageSize'),
            '1000'
          );
          assert.equal(capturedSignal, controller.signal);
          assert.deepEqual(result, [
            {
              idUsuarioGrupoOpcion: 1,
              idUsuario: 14931,
              idGrupo: 156,
              idOpcion: 10,
              consultar: true,
              insertar: false,
              editar: false,
              eliminar: false,
              exportar: false,
              estadoActivo: true,
              crea: 100,
              fechaCrea: '2026-08-10 12:56:48',
            },
          ]);
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
    test(
      'recupera la auditoría desde el detalle cuando el listado por usuario y grupo no la informa correctamente',
      async () => {
        const originalFetch = globalThis.fetch;
        const requestedUrls: string[] = [];

        globalThis.fetch = async (input) => {
          const url = new URL(String(input));
          requestedUrls.push(url.pathname);

          if (
            url.pathname.endsWith(
              '/v1/UsuarioGrupoOpcion/GetByIdUsuarioIdGrupo'
            )
          ) {
            return createJsonResponse({
              code: '00',
              message: 'OK',
              messageUser: 'OK',
              statusCode: 200,
              pageNumber: 1,
              pageSize: 1000,
              totalRecords: 1,
              totalPages: 1,
              response: [
                listadoItem({
                  nCrea: 0,
                  dFechaCrea: null,
                }),
              ],
            });
          }

          if (
            url.pathname.endsWith(
              '/v1/UsuarioGrupoOpcion/1'
            )
          ) {
            return createJsonResponse({
              code: '00',
              message: 'OK',
              messageUser: 'OK',
              statusCode: 200,
              response: {
                nId_UsuarioGrupoOpcion: 1,
                nId_Usuario: 14931,
                nId_Grupo: 156,
                nId_Opcion: 10,
                bConsultar: true,
                bInsertar: null,
                bEditar: false,
                bEliminar: null,
                bExportar: null,
                bEstado: true,
                nCrea: 100,
                dFechaCrea:
                  '2026-08-10 12:56:48',
                nModifica: null,
                dFechaModifica: null,
              },
            });
          }

          throw new Error(
            `URL inesperada en prueba: ${url.toString()}`
          );
        };

        try {
          const result =
            await fetchUsuarioGrupoOpcionesByUsuarioGrupo(
              14931,
              156
            );

          assert.equal(
            requestedUrls.filter((pathname) =>
              pathname.endsWith(
                '/v1/UsuarioGrupoOpcion/GetByIdUsuarioIdGrupo'
              )
            ).length,
            1
          );
          assert.equal(
            requestedUrls.filter((pathname) =>
              pathname.endsWith(
                '/v1/UsuarioGrupoOpcion/1'
              )
            ).length,
            1
          );
          assert.equal(result[0]?.crea, 100);
          assert.equal(
            result[0]?.fechaCrea,
            '2026-08-10 12:56:48'
          );
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
    test(
      'consulta el detalle por nId UsuarioGrupoOpcion',
      async () => {
        const originalFetch = globalThis.fetch;
        let capturedUrl = '';
        let capturedMethod = '';

        globalThis.fetch = async (input, init) => {
          capturedUrl = String(input);
          capturedMethod = String(init?.method);

          return createJsonResponse({
            code: '00',
            message: 'OK',
            messageUser: 'OK',
            statusCode: 200,
            response: {
              nId_UsuarioGrupoOpcion: 1,
              nId_Usuario: 14931,
              nId_Grupo: 156,
              nId_Opcion: 10,
              bConsultar: true,
              bInsertar: null,
              bEditar: false,
              bEliminar: null,
              bExportar: null,
              bEstado: true,
              nCrea: 100,
              dFechaCrea: '2026-08-10 12:56:48',
              nModifica: null,
              dFechaModifica: null,
            },
          });
        };

        try {
          const result =
            await fetchUsuarioGrupoOpcionById(1);

          assert.match(
            new URL(capturedUrl).pathname,
            /\/v1\/UsuarioGrupoOpcion\/1$/
          );
          assert.equal(capturedMethod, 'GET');
          assert.equal(result.idUsuario, 14931);
          assert.equal(result.idGrupo, 156);
          assert.equal(result.insertar, false);
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
    test(
      'reactiva existentes con PUT y registra opciones nuevas con POST sin duplicarlas',
      async () => {
        const originalFetch = globalThis.fetch;
        const calls: Array<{
          method: string;
          body: Record<string, unknown>;
        }> = [];

        globalThis.fetch = async (_input, init) => {
          const method = String(init?.method);
          const body = JSON.parse(
            String(init?.body)
          ) as Record<string, unknown>;

          calls.push({ method, body });

          const assignmentId =
            method === 'PUT'
              ? Number(body.nId_UsuarioGrupoOpcion)
              : 99;

          return createJsonResponse({
            code: '00',
            message: 'OK',
            messageUser: 'OK',
            statusCode: 200,
            response: {
              nId_UsuarioGrupoOpcion: assignmentId,
              nId_Usuario: body.nId_Usuario,
              nId_Grupo: body.nId_Grupo,
              nId_Opcion: body.nId_Opcion,
            },
          });
        };

        try {
          await addUsuarioGrupoOpciones(
            [
              existing({
                fechaCrea:
                  '2026-08-10 12:56:48',
              }),
            ],
            {
              usuarioId: 14931,
              grupoId: 156,
              assignments: [
                {
                  opcionId: 10,
                  permissions: {
                    consultar: true,
                    insertar: true,
                    editar: false,
                    eliminar: false,
                    exportar: false,
                  },
                },
                {
                  opcionId: 11,
                  permissions: {
                    consultar: true,
                    insertar: false,
                    editar: true,
                    eliminar: false,
                    exportar: false,
                  },
                },
              ],
            },
            '777'
          );

          assert.equal(calls.length, 2);
          assert.equal(calls[0]?.method, 'PUT');
          assert.equal(
            calls[0]?.body.nId_UsuarioGrupoOpcion,
            1
          );
          assert.equal(calls[0]?.body.bEstado, true);
          assert.equal(calls[0]?.body.nCrea, 100);
          assert.equal(
            calls[0]?.body.dFechaCrea,
            '2026-08-10T12:56:48.000'
          );
          assert.equal(calls[0]?.body.nModifica, 777);
          assert.equal(calls[1]?.method, 'POST');
          assert.equal(calls[1]?.body.nId_Opcion, 11);
          assert.equal(calls[1]?.body.nCrea, 777);
          assert.equal(calls[1]?.body.bEstado, true);
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
  ]
);
