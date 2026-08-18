import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  createUsuarioGrupo,
  fetchGruposByUsuario,
  removeUsuarioGrupo,
} from './usuarioGruposApi';

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

export const suite = defineSuite(
  'usuarioGruposApi',
  [
    test(
      'consulta grupos asignados y conserva nId_UGrupo separado de nid_grupo',
      async () => {
        const originalFetch =
          globalThis.fetch;
        let capturedUrl = '';

        globalThis.fetch = async (input) => {
          capturedUrl = String(input);

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
                nId_UGrupo: 9001,
                nId_Usuario: 16068,
                nid_grupo: 219,
                cNombre_Grupo:
                  'ADEX INSTITUTO',
              },
            ],
          });
        };

        try {
          const groups =
            await fetchGruposByUsuario(
              16068
            );

          assert.deepEqual(groups, [
            {
              idUsuarioGrupo: 9001,
              idUsuario: 16068,
              idGrupo: 219,
              nombre: 'ADEX INSTITUTO',
            },
          ]);

          const url = new URL(
            capturedUrl
          );

          assert.equal(
            url.pathname,
            '/v1/UGrupo/GetGruposByIdUsuario'
          );
          assert.equal(
            url.searchParams.get(
              'nId_Usuario'
            ),
            '16068'
          );
          assert.equal(
            url.searchParams.get(
              'PageSize'
            ),
            '1000'
          );
        } finally {
          globalThis.fetch =
            originalFetch;
        }
      }
    ),

    test(
      'agrega una asignación mediante POST sin confundir el id del grupo con nId_UGrupo',
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

          return createJsonResponse({
            code: '00',
            message: 'OK',
            messageUser: 'OK',
            statusCode: 200,
            response: {
              nId_UGrupo: 9002,
              nId_Usuario: 16068,
              nId_Grupo: 247,
            },
          });
        };

        try {
          await createUsuarioGrupo(
            16068,
            247
          );

          assert.equal(
            capturedMethod,
            'POST'
          );
          assert.equal(
            capturedBody.nId_Usuario,
            16068
          );
          assert.equal(
            capturedBody.nId_Grupo,
            247
          );
          assert.equal(
            capturedBody.bEstado,
            true
          );
          assert.equal(
            capturedBody.bActivo,
            true
          );
          assert.equal(
            capturedBody.bGestion,
            true
          );
        } finally {
          globalThis.fetch =
            originalFetch;
        }
      }
    ),


    test(
      'impide quitar un grupo cuando el backend todavía no devuelve nId_UGrupo',
      async () => {
        await assert.rejects(
          () =>
            removeUsuarioGrupo({
              idUsuarioGrupo: null,
              idUsuario: 16068,
              idGrupo: 219,
              nombre: 'ADEX INSTITUTO',
            }),
          /No se pudo identificar la asignación/i
        );
      }
    ),

    test(
      'quita una asignación mediante PUT usando nId_UGrupo como id de la relación',
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

          return createJsonResponse({
            code: '00',
            message: 'OK',
            messageUser: 'OK',
            statusCode: 200,
            response: {
              nId_UGrupo: 9001,
              nId_Usuario: 16068,
              nId_Grupo: 219,
            },
          });
        };

        try {
          await removeUsuarioGrupo({
            idUsuarioGrupo: 9001,
            idUsuario: 16068,
            idGrupo: 219,
            nombre: 'ADEX INSTITUTO',
          });

          assert.equal(
            capturedMethod,
            'PUT'
          );
          assert.equal(
            capturedBody.nId_UGrupo,
            9001
          );
          assert.equal(
            capturedBody.nId_Grupo,
            219
          );
          assert.equal(
            capturedBody.bEstado,
            false
          );
          assert.equal(
            capturedBody.bActivo,
            false
          );
          assert.equal(
            capturedBody.bGestion,
            false
          );
        } finally {
          globalThis.fetch =
            originalFetch;
        }
      }
    ),
  ]
);
