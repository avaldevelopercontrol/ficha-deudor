import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  fetchUsuarioGrupoOpcionesListado,
} from './usuarioGrupoOpcionesApi';

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
  'usuarioGrupoOpcionesApi',
  [
    test(
      'consume GetUsuarioGrupoOpcionListado con la paginación de carga y propaga AbortSignal',
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
            pageNumber: 1,
            pageSize: 1000,
            totalRecords: 1,
            totalPages: 1,
            response: [
              {
                nId_UsuarioGrupoOpcion: 1,
                nId_Usuario: 14931,
                cUsr_NroDoc: '42287423',
                cUsr_ApePat: 'Martinez',
                cUsr_ApeMat: 'Zapana',
                cUsr_Nombres: 'Luis Pierre',
                cUsr_Login: '14931',
                nId_Grupo: 22,
                cNombre_Grupo: 'BACKUS',
                nId_Opcion: 10,
                sCodigoOpcion:
                  'mMantenerPerfil',
                sNombreOpcion:
                  'Mantener perfil',
                bConsultar: true,
                bInsertar: null,
                bEditar: null,
                bEliminar: null,
                bExportar: null,
                bEstado: true,
                nCrea: 14931,
                dFechaCrea:
                  '2026-08-10 12:56:48',
                nModifica: null,
                dFechaModifica: null,
              },
            ],
          });
        };

        try {
          const result =
            await fetchUsuarioGrupoOpcionesListado(
              controller.signal
            );

          const url = new URL(
            capturedUrl
          );

          assert.match(
            url.pathname,
            /\/v1\/UsuarioGrupoOpcion\/GetUsuarioGrupoOpcionListado$/
          );
          assert.equal(
            url.searchParams.get(
              'PageNumber'
            ),
            '1'
          );
          assert.equal(
            url.searchParams.get(
              'PageSize'
            ),
            '1000'
          );
          assert.equal(
            capturedMethod,
            'GET'
          );
          assert.equal(
            capturedSignal,
            controller.signal
          );
          assert.equal(
            result.length,
            1
          );
          assert.deepEqual(
            result[0],
            {
              idUsuarioGrupoOpcion: 1,
              idUsuario: 14931,
              usuario: '14931',
              nombreCompleto:
                'Luis Pierre Martinez Zapana',
              idGrupo: 22,
              grupo: 'BACKUS',
              idOpcion: 10,
              codigoOpcion:
                'mMantenerPerfil',
              opcion: 'Mantener perfil',
              consultar: true,
              insertar: false,
              editar: false,
              eliminar: false,
              exportar: false,
              estado: 'Activo',
            }
          );
        } finally {
          globalThis.fetch =
            originalFetch;
        }
      }
    ),
    test(
      'carga las páginas restantes cuando el listado supera mil registros',
      async () => {
        const originalFetch =
          globalThis.fetch;
        const requestedPages: string[] = [];

        globalThis.fetch = async (
          input
        ) => {
          const url = new URL(
            String(input)
          );
          const pageNumber =
            url.searchParams.get(
              'PageNumber'
            ) ?? '';

          requestedPages.push(
            pageNumber
          );

          const id =
            pageNumber === '2'
              ? 2
              : 1;

          return createJsonResponse({
            code: '00',
            message: 'OK',
            messageUser: 'OK',
            statusCode: 200,
            pageNumber: Number(
              pageNumber
            ),
            pageSize: 1000,
            totalRecords: 1001,
            totalPages: 2,
            response: [
              {
                nId_UsuarioGrupoOpcion: id,
                nId_Usuario: 14931,
                cUsr_NroDoc: '42287423',
                cUsr_ApePat: 'Martinez',
                cUsr_ApeMat: 'Zapana',
                cUsr_Nombres: 'Luis Pierre',
                cUsr_Login: '14931',
                nId_Grupo: 22,
                cNombre_Grupo: 'BACKUS',
                nId_Opcion: 10,
                sCodigoOpcion:
                  'mMantenerPerfil',
                sNombreOpcion:
                  'Mantener perfil',
                bConsultar: true,
                bInsertar: null,
                bEditar: null,
                bEliminar: null,
                bExportar: null,
                bEstado: true,
                nCrea: 14931,
                dFechaCrea:
                  '2026-08-10 12:56:48',
                nModifica: null,
                dFechaModifica: null,
              },
            ],
          });
        };

        try {
          const result =
            await fetchUsuarioGrupoOpcionesListado();

          assert.deepEqual(
            requestedPages,
            ['1', '2']
          );
          assert.deepEqual(
            result.map(
              (item) =>
                item.idUsuarioGrupoOpcion
            ),
            [1, 2]
          );
        } finally {
          globalThis.fetch =
            originalFetch;
        }
      }
    ),

    test(
      'prioriza messageUser cuando la API responde con error HTTP',
      async () => {
        const originalFetch =
          globalThis.fetch;

        globalThis.fetch = async () =>
          createJsonResponse(
            {
              code: '01',
              message:
                'Error interno',
              messageUser:
                'No fue posible listar los accesos.',
              statusCode: 400,
              response: null,
            },
            400
          );

        try {
          await assert.rejects(
            () =>
              fetchUsuarioGrupoOpcionesListado(),
            /No fue posible listar los accesos\./
          );
        } finally {
          globalThis.fetch =
            originalFetch;
        }
      }
    ),
  ]
);
