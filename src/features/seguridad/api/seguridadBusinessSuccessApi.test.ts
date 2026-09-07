import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import type {
  Modulo,
} from '../types/opcion.types';

import {
  createGrupo,
} from './gruposApi';
import {
  createOpcion,
} from './opcionesApi';
import {
  createPerfil,
} from './perfilesApi';
import {
  createPerfilOpciones,
} from './perfilOpcionesApi';
import {
  addUsuarioGrupoOpciones,
} from './usuarioGrupoOpcionesApi';

const createBusinessErrorResponse = (
  messageUser: string
): Response =>
  new Response(
    JSON.stringify({
      code: '052',
      message: 'Error de negocio',
      messageUser,
      statusCode: 200,
      response: {},
    }),
    {
      status: 200,
      headers: {
        'Content-Type':
          'application/json',
      },
    }
  );

const withBusinessErrorFetch = async (
  messageUser: string,
  run: () => Promise<unknown>
): Promise<void> => {
  const originalFetch =
    globalThis.fetch;

  globalThis.fetch = async () =>
    createBusinessErrorResponse(
      messageUser
    );

  try {
    await assert.rejects(
      run,
      new RegExp(messageUser)
    );
  } finally {
    globalThis.fetch =
      originalFetch;
  }
};

const parentModulo: Modulo = {
  idModulo: 1,
  nombre: 'Seguridad',
  descripcion: 'Seguridad',
  codigo: 'seguridad',
  ruta: '/seguridad',
  urlBI: null,
  imagenOpcion: null,
  emailOpcion: null,
  icono: 'shield',
  tipo: 0,
  idPadre: 0,
  codigoPadre: '',
  padre: '',
  orden: 1,
  visibleActivo: true,
  visible: 'Sí',
  estadoActivo: true,
  estado: 'Activo',
};

export const suite = defineSuite(
  'seguridad API business success',
  [
    test(
      'Mantener perfil rechaza HTTP 200 cuando code informa error',
      async () => {
        await withBusinessErrorFetch(
          'No se pudo registrar el perfil desde la API.',
          () =>
            createPerfil({
              nombrePerfil: 'Supervisor',
              abreviatura: 'SUP',
              estado: 1,
            })
        );
      }
    ),
    test(
      'Mantener grupo rechaza HTTP 200 cuando code informa error',
      async () => {
        await withBusinessErrorFetch(
          'No se pudo registrar el grupo desde la API.',
          () =>
            createGrupo({
              nombre: 'Grupo prueba',
              sigla: 'GP',
              clienteId: 95,
              estado: true,
            })
        );
      }
    ),
    test(
      'Mantener módulo rechaza HTTP 200 cuando code informa error',
      async () => {
        await withBusinessErrorFetch(
          'No se pudo registrar el módulo desde la API.',
          () =>
            createOpcion(
              {
                nombre: 'Módulo prueba',
                descripcion:
                  'Módulo para prueba',
                codigo: 'modulo-prueba',
                icono: 'folder',
                esPowerBI: false,
                urlBI: '',
                imagenOpcion: '',
                emailOpcion: '',
                padreId: 1,
                visible: true,
                estado: true,
              },
              [parentModulo],
              '16068'
            )
        );
      }
    ),
    test(
      'Mantener accesos por perfil rechaza HTTP 200 cuando code informa error',
      async () => {
        await withBusinessErrorFetch(
          'No se pudieron registrar los accesos del perfil desde la API.',
          () =>
            createPerfilOpciones(
              {
                perfilId: 9,
                assignments: [
                  {
                    opcionId: 10,
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
            )
        );
      }
    ),
    test(
      'Mantener accesos por usuario rechaza HTTP 200 cuando code informa error',
      async () => {
        await withBusinessErrorFetch(
          'No se pudieron registrar los accesos del usuario desde la API.',
          () =>
            addUsuarioGrupoOpciones(
              [],
              {
                usuarioId: 14931,
                grupoId: 156,
                assignments: [
                  {
                    opcionId: 10,
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
            )
        );
      }
    ),
  ]
);
