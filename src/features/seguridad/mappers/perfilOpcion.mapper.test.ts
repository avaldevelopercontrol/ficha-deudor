import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  mapPerfilAccesoOption,
  mapPerfilOpcionCount,
  mapPerfilOpcionDetalle,
  mapPerfilOptionsCountResponse,
} from './perfilOpcion.mapper';

import type {
  PerfilOpcionCountApi,
} from '../types/perfilOpcion.types';

const createItem = (
  overrides: Partial<PerfilOpcionCountApi> = {}
): PerfilOpcionCountApi => ({
  nId_Perfil: 9,
  per_Nombre:
    'Administrador Base Datos      ',
  nCantidadOpciones: 3,
  ...overrides,
});

export const suite = defineSuite(
  'perfilOpcion.mapper',
  [
    test(
      'normaliza el perfil y elimina espacios del nombre',
      () => {
        assert.deepEqual(
          mapPerfilOpcionCount(
            createItem()
          ),
          {
            idPerfil: 9,
            nombrePerfil:
              'Administrador Base Datos',
            cantidadOpciones: 3,
          }
        );
      }
    ),

    test(
      'normaliza perfiles reducidos para el selector',
      () => {
        assert.deepEqual(
          mapPerfilAccesoOption({
            nid_perfil: 9,
            per_Nombre:
              'Administrador Base Datos      ',
            nEstadoGest: 1,
          }),
          {
            idPerfil: 9,
            nombrePerfil:
              'Administrador Base Datos',
            estadoActivo: true,
          }
        );

        assert.throws(
          () =>
            mapPerfilAccesoOption({
              nid_perfil: 0,
              per_Nombre: 'Inválido',
              nEstadoGest: 1,
            }),
          /nid_perfil/
        );

        assert.deepEqual(
          mapPerfilAccesoOption({
            nid_perfil: 31,
            per_Nombre: 'Cliente BITEL 1',
            nEstadoGest: 0,
          }),
          {
            idPerfil: 31,
            nombrePerfil: 'Cliente BITEL 1',
            estadoActivo: false,
          }
        );

        assert.throws(
          () =>
            mapPerfilAccesoOption({
              nid_perfil: 31,
              per_Nombre: 'Inválido',
              nEstadoGest: 2,
            }),
          /nEstadoGest/
        );
      }
    ),
    test(
      'normaliza el detalle de una opción asignada al perfil',
      () => {
        assert.deepEqual(
          mapPerfilOpcionDetalle({
            nId_PerfilOpcion: 25,
            nId_Perfil: 9,
            nId_Opcion: 6,
            bConsultar: true,
            bInsertar: false,
            bEditar: true,
            bEliminar: false,
            bExportar: true,
            bEstado: true,
            nCrea: 14931,
            dFechaCrea:
              '2026-08-03 13:15:29',
            nModifica: 0,
            dFechaModifica: '',
          }),
          {
            idPerfilOpcion: 25,
            idPerfil: 9,
            idOpcion: 6,
            consultar: true,
            insertar: false,
            editar: true,
            eliminar: false,
            exportar: true,
            estadoActivo: true,
          }
        );
      }
    ),

    test(
      'acepta colección objeto único y respuesta vacía',
      () => {
        assert.deepEqual(
          mapPerfilOptionsCountResponse([
            createItem({
              nId_Perfil: 1,
            }),
            createItem({
              nId_Perfil: 2,
            }),
          ]).map(
            (item) => item.idPerfil
          ),
          [1, 2]
        );

        assert.equal(
          mapPerfilOptionsCountResponse(
            createItem()
          ).length,
          1
        );

        assert.deepEqual(
          mapPerfilOptionsCountResponse(
            null
          ),
          []
        );
      }
    ),
    test(
      'rechaza identificadores nombres y cantidades inválidas',
      () => {
        assert.throws(
          () =>
            mapPerfilOpcionCount(
              createItem({
                nId_Perfil: 0,
              })
            ),
          /nId_Perfil/
        );

        assert.throws(
          () =>
            mapPerfilOpcionCount(
              createItem({
                per_Nombre: '   ',
              })
            ),
          /per_Nombre/
        );

        assert.throws(
          () =>
            mapPerfilOpcionCount(
              createItem({
                nCantidadOpciones: -1,
              })
            ),
          /nCantidadOpciones/
        );

        assert.throws(
          () =>
            mapPerfilOpcionCount(
              createItem({
                nCantidadOpciones: 1.5,
              })
            ),
          /nCantidadOpciones/
        );
      }
    ),
  ]
);
