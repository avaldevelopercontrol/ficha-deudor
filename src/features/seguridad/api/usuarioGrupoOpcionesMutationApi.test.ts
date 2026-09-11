import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import type {
  CreateUsuarioGrupoOpcionRequest,
  UpdateUsuarioGrupoOpcionRequest,
} from '../types/usuarioGrupoOpcion.types';
import {
  executeUsuarioGrupoOpcionMutationPlan,
} from './usuarioGrupoOpcionesMutationApi';

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

const updateRequest = (
  optionId: number
): UpdateUsuarioGrupoOpcionRequest => ({
  nId_UsuarioGrupoOpcion: optionId + 100,
  nId_Usuario: 10,
  nId_Grupo: 20,
  nId_Opcion: optionId,
  bConsultar: true,
  bInsertar: false,
  bEditar: false,
  bEliminar: false,
  bExportar: false,
  bEstado: true,
  nCrea: 99,
  dFechaCrea: '2026-08-10T12:00:00.000',
  nModifica: 100,
  dFechaModifica: '2026-09-11T10:00:00.000',
});

const createRequest = (
  optionId: number
): CreateUsuarioGrupoOpcionRequest => ({
  nId_Usuario: 10,
  nId_Grupo: 20,
  nId_Opcion: optionId,
  bConsultar: true,
  bInsertar: false,
  bEditar: false,
  bEliminar: false,
  bExportar: false,
  bEstado: true,
  nCrea: 100,
  dFechaCrea: '2026-09-11T10:00:00.000',
});

export const suite = defineSuite(
  'usuarioGrupoOpcionesMutationApi',
  [
    test(
      'ejecuta primero las actualizaciones y después las altas de forma secuencial',
      async () => {
        const originalFetch = globalThis.fetch;
        const calls: string[] = [];

        globalThis.fetch = async (_input, init) => {
          const method = String(init?.method);
          const body = JSON.parse(
            String(init?.body)
          ) as Record<string, unknown>;
          const optionId = Number(
            body.nId_Opcion
          );

          calls.push(`${method}:${optionId}`);

          return createJsonResponse({
            code: '00',
            message: 'OK',
            messageUser: 'OK',
            statusCode: 200,
            response: {
              nId_UsuarioGrupoOpcion:
                method === 'PUT'
                  ? Number(
                      body.nId_UsuarioGrupoOpcion
                    )
                  : optionId + 200,
              nId_Usuario: 10,
              nId_Grupo: 20,
              nId_Opcion: optionId,
            },
          });
        };

        try {
          await executeUsuarioGrupoOpcionMutationPlan(
            [
              updateRequest(1),
              updateRequest(2),
            ],
            [createRequest(3)]
          );

          assert.deepEqual(calls, [
            'PUT:1',
            'PUT:2',
            'POST:3',
          ]);
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
    test(
      'informa el progreso parcial y detiene las operaciones restantes después de un fallo',
      async () => {
        const originalFetch = globalThis.fetch;
        const calls: string[] = [];

        globalThis.fetch = async (_input, init) => {
          const method = String(init?.method);
          const body = JSON.parse(
            String(init?.body)
          ) as Record<string, unknown>;
          const optionId = Number(
            body.nId_Opcion
          );

          calls.push(`${method}:${optionId}`);

          if (optionId === 2) {
            return createJsonResponse({
              code: '052',
              message: 'Error técnico',
              messageUser: 'No autorizado',
              statusCode: 200,
              response: null,
            });
          }

          return createJsonResponse({
            code: '00',
            message: 'OK',
            messageUser: 'OK',
            statusCode: 200,
            response: {
              nId_UsuarioGrupoOpcion:
                Number(
                  body.nId_UsuarioGrupoOpcion
                ),
              nId_Usuario: 10,
              nId_Grupo: 20,
              nId_Opcion: optionId,
            },
          });
        };

        try {
          await assert.rejects(
            () =>
              executeUsuarioGrupoOpcionMutationPlan(
                [
                  updateRequest(1),
                  updateRequest(2),
                ],
                [createRequest(3)]
              ),
            /Se procesaron 1 de 3 cambios.*opción 2.*No autorizado/i
          );
          assert.deepEqual(calls, [
            'PUT:1',
            'PUT:2',
          ]);
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
  ]
);
