import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  mapUsuarioGrupoOpcionListado,
  mapUsuarioGrupoOpcionesListadoResponse,
} from './usuarioGrupoOpcion.mapper';

import type {
  UsuarioGrupoOpcionListadoApi,
} from '../types/usuarioGrupoOpcion.types';

const createItem = (
  overrides: Partial<UsuarioGrupoOpcionListadoApi> = {}
): UsuarioGrupoOpcionListadoApi => ({
  nId_UsuarioGrupoOpcion: 1,
  nId_Usuario: 14931,
  cUsr_NroDoc: '42287423',
  cUsr_ApePat: ' Martinez ',
  cUsr_ApeMat: ' Zapana ',
  cUsr_Nombres: ' Luis Pierre ',
  cUsr_Login: '14931',
  nId_Grupo: 22,
  cNombre_Grupo: ' BACKUS ',
  nId_Opcion: 10,
  sCodigoOpcion: 'mMantenerPerfil',
  sNombreOpcion: ' Mantener perfil ',
  bConsultar: true,
  bInsertar: null,
  bEditar: null,
  bEliminar: null,
  bExportar: null,
  bEstado: true,
  nCrea: 14931,
  dFechaCrea: '2026-08-10 12:56:48',
  nModifica: null,
  dFechaModifica: null,
  ...overrides,
});

export const suite = defineSuite(
  'usuarioGrupoOpcion.mapper',
  [
    test(
      'normaliza el registro de usuario grupo y opción para la tabla',
      () => {
        assert.deepEqual(
          mapUsuarioGrupoOpcionListado(
            createItem()
          ),
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
      }
    ),
    test(
      'construye el nombre aun cuando un apellido no esté informado',
      () => {
        const result =
          mapUsuarioGrupoOpcionListado(
            createItem({
              cUsr_ApeMat: '   ',
              bEstado: false,
            })
          );

        assert.equal(
          result.nombreCompleto,
          'Luis Pierre Martinez'
        );
        assert.equal(
          result.estado,
          'Inactivo'
        );
      }
    ),
    test(
      'acepta colección objeto único y respuesta vacía',
      () => {
        assert.equal(
          mapUsuarioGrupoOpcionesListadoResponse([
            createItem(),
            createItem({
              nId_UsuarioGrupoOpcion: 2,
            }),
          ]).length,
          2
        );

        assert.equal(
          mapUsuarioGrupoOpcionesListadoResponse(
            createItem()
          ).length,
          1
        );

        assert.deepEqual(
          mapUsuarioGrupoOpcionesListadoResponse(
            null
          ),
          []
        );
      }
    ),
    test(
      'rechaza identificadores y datos obligatorios inválidos',
      () => {
        assert.throws(
          () =>
            mapUsuarioGrupoOpcionListado(
              createItem({
                nId_UsuarioGrupoOpcion: 0,
              })
            ),
          /nId_UsuarioGrupoOpcion/
        );

        assert.throws(
          () =>
            mapUsuarioGrupoOpcionListado(
              createItem({
                cUsr_Nombres: ' ',
                cUsr_ApePat: ' ',
                cUsr_ApeMat: ' ',
              })
            ),
          /nombre del usuario/
        );
      }
    ),
  ]
);
