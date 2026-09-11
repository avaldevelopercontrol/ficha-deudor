import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import type {
  GrupoDetalleApi,
} from '../types/grupo.types';
import type {
  PerfilApi,
} from '../types/perfil.types';

import {
  fetchClientesActivos,
} from './clientesApi';
import {
  createGrupo,
  fetchGrupoById,
  fetchGruposListado,
  updateGrupo,
} from './gruposApi';
import {
  createPerfil,
  fetchPerfilById,
  fetchPerfiles,
  updatePerfil,
} from './perfilesApi';

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

const createBusinessEnvelope = <T>(
  response: T
) => ({
  code: '00',
  message: 'OK',
  messageUser: 'OK',
  statusCode: 200,
  response,
});

const perfilApi: PerfilApi = {
  nid_perfil: 7,
  per_Fecha: '2026-09-01 09:00:00',
  per_Nombre: ' Supervisor ',
  nper_EliminaRegJud: 0,
  nper_AvisoVencidoJud: 1,
  nper_RegistraRegJud: 1,
  nper_MantUsuario: 0,
  per_abreviatura: ' SUP ',
  nEquiv_rrhh: 0,
  nEstadoGest: 1,
  bProduccionOnline: true,
  nId_TipoGestion: 2,
  bvisualiza_deudorhistoria: true,
};

const grupoDetalle: GrupoDetalleApi = {
  nId_Grupo: 21,
  cNombre_Grupo: 'Grupo Norte',
  cSigla_Grupo: 'GN',
  bEstado: true,
  nCant_Grupo: 5,
  nid_cliente: 95,
};

const withFetch = async (
  fetchImpl: typeof globalThis.fetch,
  run: () => Promise<void>
): Promise<void> => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = fetchImpl;

  try {
    await run();
  } finally {
    globalThis.fetch = originalFetch;
  }
};

export const suite = defineSuite(
  'contratos CRUD de seguridad',
  [
    test(
      'clientes activos exige éxito HTTP y de negocio, y normaliza la colección',
      async () => {
        await withFetch(
          async () =>
            createJsonResponse({
              ...createBusinessEnvelope([
                {
                  nId_Cliente: 95,
                  cCli_Nombre: ' Cliente Uno ',
                },
              ]),
              pageNumber: 1,
              pageSize: 1000,
              totalRecords: 1,
              totalPages: 1,
            }),
          async () => {
            const result = await fetchClientesActivos();

            assert.deepEqual(result, [
              {
                idCliente: 95,
                nombreCliente: 'Cliente Uno',
              },
            ]);
          }
        );

        await withFetch(
          async () =>
            createJsonResponse({
              ...createBusinessEnvelope([]),
              code: '052',
              messageUser: 'Clientes no disponibles.',
              pageNumber: 1,
              pageSize: 1000,
              totalRecords: 0,
              totalPages: 0,
            }),
          async () => {
            await assert.rejects(
              () => fetchClientesActivos(),
              /Clientes no disponibles\./
            );
          }
        );
      }
    ),
    test(
      'clientes activos propaga AbortSignal y conserva AbortError',
      async () => {
        const controller = new AbortController();
        const abortError = new Error('Solicitud cancelada');
        abortError.name = 'AbortError';
        let receivedSignal: AbortSignal | null | undefined;

        await withFetch(
          async (_input, init) => {
            receivedSignal = init?.signal;
            throw abortError;
          },
          async () => {
            await assert.rejects(
              () => fetchClientesActivos(controller.signal),
              (error: unknown) => {
                assert.equal(error, abortError);
                assert.equal(
                  (error as Error).name,
                  'AbortError'
                );
                return true;
              }
            );
            assert.equal(receivedSignal, controller.signal);
          }
        );
      }
    ),
    test(
      'perfiles usa paginación fija, propaga signal y mapea el listado',
      async () => {
        const controller = new AbortController();
        let capturedUrl = '';
        let capturedSignal: AbortSignal | null | undefined;

        await withFetch(
          async (input, init) => {
            capturedUrl = String(input);
            capturedSignal = init?.signal;
            return createJsonResponse(
              createBusinessEnvelope([perfilApi])
            );
          },
          async () => {
            const result = await fetchPerfiles(controller.signal);
            const url = new URL(capturedUrl, 'http://localhost');

            assert.equal(url.pathname, '/v1/Perfil');
            assert.equal(url.searchParams.get('PageNumber'), '1');
            assert.equal(url.searchParams.get('PageSize'), '1000');
            assert.equal(capturedSignal, controller.signal);
            assert.deepEqual(result, [
              {
                idPerfil: 7,
                nombrePerfil: 'Supervisor',
                abreviatura: 'SUP',
                fechaRegistro: '01/09/2026',
                estado: 'Activo',
                produccionOnline: 'Sí',
                historiaDeudor: 'Sí',
              },
            ]);
          }
        );
      }
    ),
    test(
      'perfil valida el id antes del GET y conserva AbortError',
      async () => {
        const originalFetch = globalThis.fetch;
        let fetchCalls = 0;
        globalThis.fetch = async () => {
          fetchCalls += 1;
          return createJsonResponse(createBusinessEnvelope(perfilApi));
        };

        try {
          await assert.rejects(
            () => fetchPerfilById(0),
            /identificador del perfil no es válido/i
          );
          assert.equal(fetchCalls, 0);
        } finally {
          globalThis.fetch = originalFetch;
        }

        const abortError = new Error('cancelado');
        abortError.name = 'AbortError';

        await withFetch(
          async () => {
            throw abortError;
          },
          async () => {
            await assert.rejects(
              () => fetchPerfilById(7),
              (error: unknown) => {
                assert.equal(error, abortError);
                return true;
              }
            );
          }
        );
      }
    ),
    test(
      'perfil crea y actualiza usando los verbos y payloads esperados',
      async () => {
        const requests: Array<{
          method: string;
          body: Record<string, unknown>;
        }> = [];

        await withFetch(
          async (_input, init) => {
            requests.push({
              method: String(init?.method),
              body: JSON.parse(String(init?.body)) as Record<string, unknown>,
            });

            return createJsonResponse(
              createBusinessEnvelope({
                nid_Perfil: 7,
                per_Nombre: 'Supervisor',
              })
            );
          },
          async () => {
            await createPerfil({
              nombrePerfil: ' Supervisor ',
              abreviatura: ' SUP ',
              estado: 1,
            });

            await updatePerfil(perfilApi, {
              nombrePerfil: ' Supervisor Senior ',
              abreviatura: ' SPS ',
              estado: 0,
            });
          }
        );

        assert.equal(requests[0]?.method, 'POST');
        assert.equal(requests[0]?.body.nid_perfil, 0);
        assert.equal(requests[0]?.body.per_Nombre, 'Supervisor');
        assert.equal(requests[0]?.body.per_abreviatura, 'SUP');
        assert.equal(requests[0]?.body.nEstadoGest, 1);

        assert.equal(requests[1]?.method, 'PUT');
        assert.equal(requests[1]?.body.nid_perfil, 7);
        assert.equal(requests[1]?.body.per_Nombre, 'Supervisor Senior');
        assert.equal(requests[1]?.body.per_abreviatura, 'SPS');
        assert.equal(requests[1]?.body.nEstadoGest, 0);
        assert.equal(
          requests[1]?.body.nper_AvisoVencidoJud,
          perfilApi.nper_AvisoVencidoJud
        );
      }
    ),
    test(
      'grupos lista, obtiene detalle y conserva el contrato del id seleccionado',
      async () => {
        const requestedPaths: string[] = [];

        await withFetch(
          async (input) => {
            const url = new URL(String(input), 'http://localhost');
            requestedPaths.push(url.pathname);

            if (url.pathname.endsWith('/GetGruposListado')) {
              return createJsonResponse(
                createBusinessEnvelope([
                  {
                    ...grupoDetalle,
                    cCli_Nombre: 'Cliente Uno',
                  },
                ])
              );
            }

            return createJsonResponse(
              createBusinessEnvelope(grupoDetalle)
            );
          },
          async () => {
            const listado = await fetchGruposListado();
            const detalle = await fetchGrupoById(21);

            assert.deepEqual(listado, [
              {
                idGrupo: 21,
                nombreGrupo: 'Grupo Norte',
                idCliente: 95,
                cliente: 'Cliente Uno',
                estado: 'Activo',
              },
            ]);
            assert.deepEqual(detalle, grupoDetalle);
          }
        );

        assert.deepEqual(requestedPaths, [
          '/v1/Grupo/GetGruposListado',
          '/v1/Grupo/21',
        ]);
      }
    ),
    test(
      'grupo crea y actualiza sin convertir una edición en alta',
      async () => {
        const requests: Array<{
          method: string;
          body: Record<string, unknown>;
        }> = [];

        await withFetch(
          async (_input, init) => {
            requests.push({
              method: String(init?.method),
              body: JSON.parse(String(init?.body)) as Record<string, unknown>,
            });

            return createJsonResponse(
              createBusinessEnvelope({
                nId_Grupo: 21,
                cNombre_Grupo: 'Grupo Norte',
              })
            );
          },
          async () => {
            await createGrupo({
              nombre: ' Grupo Norte ',
              sigla: ' GN ',
              clienteId: 95,
              estado: true,
            });

            await updateGrupo(21, grupoDetalle, {
              nombre: ' Grupo Norte 2 ',
              sigla: ' GN2 ',
              clienteId: 96,
              estado: false,
            });
          }
        );

        assert.equal(requests[0]?.method, 'POST');
        assert.equal(requests[0]?.body.nId_Grupo, 0);
        assert.equal(requests[0]?.body.cNombre_Grupo, 'Grupo Norte');
        assert.equal(requests[0]?.body.cSigla_Grupo, 'GN');

        assert.equal(requests[1]?.method, 'PUT');
        assert.equal(requests[1]?.body.nId_Grupo, 21);
        assert.equal(requests[1]?.body.cNombre_Grupo, 'Grupo Norte');
        assert.equal(requests[1]?.body.cNombre_GrupoNuevo, 'Grupo Norte 2');
        assert.equal(requests[1]?.body.cSigla_Grupo, 'GN2');
        assert.equal(requests[1]?.body.nid_cliente, 96);
      }
    ),
  ]
);
