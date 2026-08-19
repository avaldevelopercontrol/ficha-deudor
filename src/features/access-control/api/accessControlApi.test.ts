import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  fetchAccessControlData,
} from './accessControlApi';

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

const okResponse = (
  response: unknown,
  pagination: Record<string, unknown> = {}
) => ({
  code: '00',
  message: 'OK',
  messageUser: 'OK',
  statusCode: 200,
  response,
  ...pagination,
});

export const suite = defineSuite(
  'accessControlApi',
  [
    test(
      'resuelve accesos especiales sin depender de campos de auditoría',
      async () => {
        const originalFetch = globalThis.fetch;
        const requestedUrls: URL[] = [];

        globalThis.fetch = async (
          input,
          init
        ) => {
          const url = new URL(String(input));
          requestedUrls.push(url);

          assert.equal(
            init?.method,
            'GET'
          );

          if (
            url.pathname.endsWith(
              '/v1/Opcion/GetOpciones'
            )
          ) {
            return createJsonResponse(
              okResponse([
                {
                  nId_Opcion: 10,
                  sCodigoOpcion:
                    'mMantenerPerfil',
                  sNombreOpcion:
                    'Mantener perfil',
                  sDescripcionOpcion: '',
                  sUrlBI: 'https://app.powerbi.com/view?r=demo',
                  sImagenOpcion: '/logos/demo.webp',
                  sEmailOpcion: 'reportes@avalperu.com',
                  sIcono: '',
                  nTipo: 3,
                  nId_OpcionPadre: 2,
                  nOrden: 1,
                  bVisible: true,
                  bEstado: true,
                },
              ])
            );
          }

          if (
            url.pathname.endsWith(
              '/v1/PerfilOpcion/GetOpcionesPorPerfil'
            )
          ) {
            return createJsonResponse(
              okResponse([
                {
                  nId_PerfilOpcion: 5,
                  nId_Perfil: 9,
                  nId_Opcion: 10,
                  bConsultar: true,
                  bInsertar: false,
                  bEditar: false,
                  bEliminar: false,
                  bExportar: false,
                  bEstado: true,
                },
              ])
            );
          }

          if (
            url.pathname.endsWith(
              '/v1/UsuarioGrupoOpcion/GetByIdUsuarioIdGrupo'
            )
          ) {
            return createJsonResponse(
              okResponse(
                [
                  {
                    nId_UsuarioGrupoOpcion: 1,
                    nId_Usuario: 16068,
                    nId_Grupo: 156,
                    nId_Opcion: 10,
                    bConsultar: true,
                    bInsertar: true,
                    bEditar: true,
                    bEliminar: true,
                    bExportar: true,
                    bEstado: true,
                    // La autorización no debe depender de auditoría.
                    nCrea: 0,
                    dFechaCrea: null,
                  },
                ],
                {
                  pageNumber: 1,
                  pageSize: 1000,
                  totalRecords: 1,
                  totalPages: 1,
                }
              )
            );
          }

          throw new Error(
            `URL inesperada en prueba: ${url.toString()}`
          );
        };

        try {
          const result =
            await fetchAccessControlData(
              9,
              16068,
              156
            );

          assert.equal(
            result.userGroupAssignments.length,
            1
          );
          assert.equal(
            result.options[0]?.urlBI,
            'https://app.powerbi.com/view?r=demo'
          );
          assert.equal(
            result.options[0]?.image,
            '/logos/demo.webp'
          );
          assert.equal(
            result.options[0]?.email,
            'reportes@avalperu.com'
          );
          assert.deepEqual(
            result.userGroupAssignments[0],
            {
              assignmentId: 1,
              userId: 16068,
              groupId: 156,
              optionId: 10,
              permissions: {
                consultar: true,
                insertar: true,
                editar: true,
                eliminar: true,
                exportar: true,
              },
              active: true,
            }
          );

          const specialRequest =
            requestedUrls.find(
              (url) =>
                url.pathname.endsWith(
                  '/v1/UsuarioGrupoOpcion/GetByIdUsuarioIdGrupo'
                )
            );

          assert.ok(specialRequest);
          assert.equal(
            specialRequest.searchParams.get(
              'nId_Usuario'
            ),
            '16068'
          );
          assert.equal(
            specialRequest.searchParams.get(
              'nId_Grupo'
            ),
            '156'
          );
          assert.equal(
            specialRequest.searchParams.get(
              'PageNumber'
            ),
            '1'
          );
          assert.equal(
            specialRequest.searchParams.get(
              'PageSize'
            ),
            '1000'
          );
        } finally {
          globalThis.fetch = originalFetch;
        }
      }
    ),
  ]
);
