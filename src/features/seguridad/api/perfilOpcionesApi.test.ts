import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  createPerfilOpciones,
  fetchPerfilOpcionesByPerfil,
  fetchPerfilOptionsCount,
  fetchPerfilesAcceso,
  updatePerfilOpciones,
} from './perfilOpcionesApi';

const createJsonResponse = (
  body: unknown,
  status = 200
): Response =>
  new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        'Content-Type':
          'application/json',
      },
    }
  );

export const suite = defineSuite(
  'perfilOpcionesApi',
  [
    test(
      'consume GetPerfilOptionsCount y propaga AbortSignal',
      async () => {
        const originalFetch =
          globalThis.fetch;
        const controller =
          new AbortController();
        let capturedUrl = '';
        let capturedSignal:
          AbortSignal | null | undefined;

        globalThis.fetch = async (
          input,
          init
        ) => {
          capturedUrl = String(input);
          capturedSignal = init?.signal;

          return createJsonResponse({
            code: '00',
            message: 'OK',
            messageUser: 'OK',
            statusCode: 200,
            response: [
              {
                nId_Perfil: 9,
                per_Nombre:
                  'Administrador Base Datos      ',
                nCantidadOpciones: 3,
              },
            ],
          });
        };

        try {
          const result =
            await fetchPerfilOptionsCount(
              controller.signal
            );

          assert.match(
            capturedUrl,
            /\/v1\/PerfilOpcion\/GetPerfilOptionsCount$/
          );
          assert.equal(
            capturedSignal,
            controller.signal
          );
          assert.deepEqual(
            result,
            [
              {
                idPerfil: 9,
                nombrePerfil:
                  'Administrador Base Datos',
                cantidadOpciones: 3,
              },
            ]
          );
        } finally {
          globalThis.fetch =
            originalFetch;
        }
      }
    ),

    test(
      'carga perfiles desde GetPerfiles sin parámetros',
      async () => {
        const originalFetch =
          globalThis.fetch;
        const controller =
          new AbortController();
        let capturedUrl = '';
        let capturedMethod = '';
        let capturedSignal:
          AbortSignal | null | undefined;

        globalThis.fetch = async (
          input,
          init
        ) => {
          capturedUrl = String(input);
          capturedMethod =
            String(init?.method);
          capturedSignal = init?.signal;

          return createJsonResponse({
            code: '00',
            message: 'OK',
            messageUser: 'OK',
            statusCode: 200,
            response: [
              {
                nid_perfil: 9,
                per_Nombre:
                  'Administrador Base Datos      ',
                nEstadoGest: 1,
              },
            ],
          });
        };

        try {
          const result =
            await fetchPerfilesAcceso(
              controller.signal
            );

          assert.match(
            capturedUrl,
            /\/v1\/Perfil\/GetPerfiles$/
          );
          assert.doesNotMatch(
            capturedUrl,
            /\?/
          );
          assert.equal(
            capturedMethod,
            'GET'
          );
          assert.equal(
            capturedSignal,
            controller.signal
          );
          assert.deepEqual(
            result,
            [
              {
                idPerfil: 9,
                nombrePerfil:
                  'Administrador Base Datos',
                estadoActivo: true,
              },
            ]
          );
        } finally {
          globalThis.fetch =
            originalFetch;
        }
      }
    ),
    test(
      'carga los accesos del perfil enviando nId_Perfil en la cabecera',
      async () => {
        const originalFetch =
          globalThis.fetch;
        let capturedUrl = '';
        let capturedMethod = '';
        let capturedPerfilHeader: string | null =
          null;

        globalThis.fetch = async (
          input,
          init
        ) => {
          capturedUrl = String(input);
          capturedMethod =
            String(init?.method);
          capturedPerfilHeader =
            new Headers(
              init?.headers
            ).get('nId_Perfil');

          return createJsonResponse({
            code: '00',
            message: 'OK',
            messageUser: 'OK',
            statusCode: 200,
            response: [
              {
                nId_PerfilOpcion: 1,
                nId_Perfil: 9,
                nId_Opcion: 6,
                bConsultar: true,
                bInsertar: false,
                bEditar: true,
                bEliminar: false,
                bExportar: false,
                bEstado: true,
                nCrea: 14931,
                dFechaCrea:
                  '2026-08-03 13:15:29',
                nModifica: 0,
                dFechaModifica: '',
              },
            ],
          });
        };

        try {
          const result =
            await fetchPerfilOpcionesByPerfil(
              9
            );

          assert.match(
            capturedUrl,
            /\/v1\/PerfilOpcion\/GetOpcionesPorPerfil$/
          );
          assert.equal(
            capturedMethod,
            'GET'
          );
          assert.equal(
            capturedPerfilHeader,
            '9'
          );
          assert.deepEqual(result, [
            {
              idPerfilOpcion: 1,
              idPerfil: 9,
              idOpcion: 6,
              consultar: true,
              insertar: false,
              editar: true,
              eliminar: false,
              exportar: false,
              estadoActivo: true,
            },
          ]);
        } finally {
          globalThis.fetch =
            originalFetch;
        }
      }
    ),

    test(
      'registra una llamada POST por cada opción seleccionada',
      async () => {
        const originalFetch =
          globalThis.fetch;
        const requests: Array<{
          url: string;
          method: string;
          body: Record<string, unknown>;
        }> = [];

        globalThis.fetch = async (
          input,
          init
        ) => {
          const body = JSON.parse(
            String(init?.body)
          ) as Record<string, unknown>;

          requests.push({
            url: String(input),
            method: String(init?.method),
            body,
          });

          return createJsonResponse({
            code: '00',
            message: 'OK',
            messageUser: 'OK',
            statusCode: 200,
            response: {
              nId_Perfil:
                body.nId_Perfil,
              nId_Opcion:
                body.nId_Opcion,
            },
          });
        };

        try {
          await createPerfilOpciones(
            {
              perfilId: 9,
              assignments: [
                {
                  opcionId: 6,
                  permissions: {
                    consultar: true,
                    insertar: false,
                    editar: true,
                    eliminar: false,
                    exportar: false,
                  },
                },
                {
                  opcionId: 7,
                  permissions: {
                    consultar: true,
                    insertar: true,
                    editar: false,
                    eliminar: false,
                    exportar: true,
                  },
                },
              ],
            },
            '16068'
          );

          assert.equal(
            requests.length,
            2
          );
          assert.equal(
            requests[0]?.method,
            'POST'
          );
          assert.match(
            requests[0]?.url ?? '',
            /\/v1\/PerfilOpcion$/
          );
          assert.equal(
            requests[0]?.body.nId_Perfil,
            9
          );
          assert.equal(
            requests[0]?.body.nId_Opcion,
            6
          );
          assert.equal(
            requests[0]?.body.bEditar,
            true
          );
          assert.equal(
            requests[1]?.body.nId_Opcion,
            7
          );
          assert.equal(
            requests[1]?.body.bExportar,
            true
          );
          assert.equal(
            requests[0]?.body.nCrea,
            16068
          );
          assert.equal(
            requests[0]?.body.dFechaCrea,
            requests[1]?.body.dFechaCrea
          );
        } finally {
          globalThis.fetch =
            originalFetch;
        }
      }
    ),
    test(
      'actualiza existentes desactiva desmarcadas y registra opciones nuevas',
      async () => {
        const originalFetch =
          globalThis.fetch;
        const requests: Array<{
          method: string;
          body: Record<string, unknown>;
        }> = [];

        globalThis.fetch = async (
          _input,
          init
        ) => {
          const method = String(
            init?.method
          );
          const body = JSON.parse(
            String(init?.body)
          ) as Record<string, unknown>;

          requests.push({
            method,
            body,
          });

          return method === 'PUT'
            ? createJsonResponse({
                code: '00',
                message: 'OK',
                messageUser: 'OK',
                statusCode: 200,
                response: {
                  nId_PerfilOpcion:
                    body.nId_PerfilOpcion,
                  nId_Perfil:
                    body.nId_Perfil,
                  per_Nombre: 'Perfil',
                  nId_Opcion:
                    body.nId_Opcion,
                  sNombreOpcion: 'Opción',
                },
              })
            : createJsonResponse({
                code: '00',
                message: 'OK',
                messageUser: 'OK',
                statusCode: 200,
                response: {
                  nId_Perfil:
                    body.nId_Perfil,
                  nId_Opcion:
                    body.nId_Opcion,
                },
              });
        };

        try {
          await updatePerfilOpciones(
            [
              {
                idPerfilOpcion: 20,
                idPerfil: 9,
                idOpcion: 6,
                consultar: true,
                insertar: false,
                editar: false,
                eliminar: false,
                exportar: false,
                estadoActivo: true,
              },
              {
                idPerfilOpcion: 21,
                idPerfil: 9,
                idOpcion: 7,
                consultar: true,
                insertar: false,
                editar: false,
                eliminar: false,
                exportar: false,
                estadoActivo: true,
              },
            ],
            {
              perfilId: 9,
              assignments: [
                {
                  opcionId: 6,
                  permissions: {
                    consultar: true,
                    insertar: false,
                    editar: true,
                    eliminar: false,
                    exportar: false,
                  },
                },
                {
                  opcionId: 8,
                  permissions: {
                    consultar: true,
                    insertar: true,
                    editar: false,
                    eliminar: false,
                    exportar: false,
                  },
                },
              ],
            },
            '16068'
          );

          assert.equal(
            requests.length,
            3
          );
          assert.equal(
            requests[0]?.method,
            'PUT'
          );
          assert.equal(
            requests[0]?.body.nId_PerfilOpcion,
            20
          );
          assert.equal(
            requests[0]?.body.bEditar,
            true
          );
          assert.equal(
            requests[1]?.method,
            'PUT'
          );
          assert.equal(
            requests[1]?.body.nId_PerfilOpcion,
            21
          );
          assert.equal(
            requests[1]?.body.bEstado,
            false
          );
          assert.equal(
            requests[1]?.body.bConsultar,
            false
          );
          assert.equal(
            requests[1]?.body.bExportar,
            false
          );
          assert.equal(
            requests[2]?.method,
            'POST'
          );
          assert.equal(
            requests[2]?.body.nId_Opcion,
            8
          );
          assert.equal(
            requests[2]?.body.bEstado,
            true
          );
        } finally {
          globalThis.fetch =
            originalFetch;
        }
      }
    ),

    test(
      'detiene el registro e informa el avance cuando una opción falla',
      async () => {
        const originalFetch =
          globalThis.fetch;
        let callCount = 0;

        globalThis.fetch = async (
          _input,
          init
        ) => {
          callCount += 1;

          const body = JSON.parse(
            String(init?.body)
          ) as Record<string, unknown>;

          if (callCount === 2) {
            return createJsonResponse(
              {
                message:
                  'Detalle técnico',
                messageUser:
                  'La opción ya está asignada',
              },
              400
            );
          }

          return createJsonResponse({
            code: '00',
            message: 'OK',
            messageUser: 'OK',
            statusCode: 200,
            response: {
              nId_Perfil:
                body.nId_Perfil,
              nId_Opcion:
                body.nId_Opcion,
            },
          });
        };

        try {
          await assert.rejects(
            createPerfilOpciones(
              {
                perfilId: 9,
                assignments: [
                  {
                    opcionId: 6,
                    permissions: {
                      consultar: true,
                      insertar: false,
                      editar: false,
                      eliminar: false,
                      exportar: false,
                    },
                  },
                  {
                    opcionId: 7,
                    permissions: {
                      consultar: true,
                      insertar: false,
                      editar: false,
                      eliminar: false,
                      exportar: false,
                    },
                  },
                ],
              },
              '16068'
            ),
            /Se registraron 1 de 2.*La opción ya está asignada/
          );

          assert.equal(callCount, 2);
        } finally {
          globalThis.fetch =
            originalFetch;
        }
      }
    ),
    test(
      'prioriza el mensaje de usuario cuando la API informa error',
      async () => {
        const originalFetch =
          globalThis.fetch;

        globalThis.fetch = async () =>
          createJsonResponse({
            code: '01',
            message:
              'Detalle técnico',
            messageUser:
              'No fue posible consultar los perfiles',
            statusCode: 500,
            response: [],
          });

        try {
          await assert.rejects(
            fetchPerfilOptionsCount(),
            /No fue posible consultar los perfiles/
          );
        } finally {
          globalThis.fetch =
            originalFetch;
        }
      }
    ),
    test(
      'prioriza messageUser también en errores HTTP',
      async () => {
        const originalFetch =
          globalThis.fetch;

        globalThis.fetch = async () =>
          createJsonResponse(
            {
              message:
                'Detalle técnico del servidor',
              messageUser:
                'Servicio de perfiles no disponible',
            },
            500
          );

        try {
          await assert.rejects(
            fetchPerfilOptionsCount(),
            /Servicio de perfiles no disponible/
          );
        } finally {
          globalThis.fetch =
            originalFetch;
        }
      }
    ),
    test(
      'rechaza respuestas primitivas y registros manipulados',
      async () => {
        const originalFetch =
          globalThis.fetch;

        try {
          globalThis.fetch = async () =>
            createJsonResponse({
              code: '00',
              message: 'OK',
              messageUser: 'OK',
              statusCode: 200,
              response:
                'respuesta inválida',
            });

          await assert.rejects(
            fetchPerfilOptionsCount(),
            /datos válidos/i
          );

          globalThis.fetch = async () =>
            createJsonResponse({
              code: '00',
              message: 'OK',
              messageUser: 'OK',
              statusCode: 200,
              response: [
                {
                  nId_Perfil: 0,
                  per_Nombre:
                    'Perfil inválido',
                  nCantidadOpciones: 2,
                },
              ],
            });

          await assert.rejects(
            fetchPerfilOptionsCount(),
            /nId_Perfil/
          );
        } finally {
          globalThis.fetch =
            originalFetch;
        }
      }
    ),
  ]
);
