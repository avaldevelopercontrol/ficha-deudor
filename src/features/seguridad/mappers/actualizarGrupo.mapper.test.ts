import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  assertGrupoDetalleMatchesSelectedId,
  buildUpdateGrupoRequest,
  mapGrupoDetalleApiToForm,
} from './actualizarGrupo.mapper';

const grupoDetalle = {
  nId_Grupo: 248,
  cNombre_Grupo:
    ' BBVA PRUEBA ',
  cSigla_Grupo:
    ' BVA_P ',
  bEstado: true,
  nCant_Grupo: 7,
  nid_cliente: 208,
};

export const suite = defineSuite(
  'actualizarGrupo.mapper',
  [
    test(
      'convierte el detalle recibido al formulario de edición',
      () => {
        assert.deepEqual(
          mapGrupoDetalleApiToForm(
            grupoDetalle
          ),
          {
            nombre:
              'BBVA PRUEBA',
            sigla:
              'BVA_P',
            clienteId: 208,
            estado: true,
          }
        );
      }
    ),
    test(
      'construye el PUT con el ID seleccionado y no permite convertir una edición en alta',
      () => {
        assert.deepEqual(
          buildUpdateGrupoRequest(
            248,
            grupoDetalle,
            {
              nombre:
                ' BBVA ACTUALIZADO ',
              sigla:
                ' BVA_NEW ',
              clienteId: 201,
              estado: false,
            }
          ),
          {
            nId_Grupo: 248,
            cNombre_Grupo:
              'BBVA PRUEBA',
            cNombre_GrupoNuevo:
              'BBVA ACTUALIZADO',
            cSigla_Grupo:
              'BVA_NEW',
            bEstado: false,
            nCant_Grupo: null,
            nid_cliente: 201,
          }
        );
      }
    ),
    test(
      'rechaza un detalle cuyo ID no coincide con la fila seleccionada',
      () => {
        assert.throws(
          () =>
            assertGrupoDetalleMatchesSelectedId(
              249,
              grupoDetalle
            ),
          /no corresponde al registro seleccionado/i
        );
      }
    ),
    test(
      'rechaza IDs cero para evitar que el backend los interprete como una creación',
      () => {
        assert.throws(
          () =>
            buildUpdateGrupoRequest(
              0,
              grupoDetalle,
              {
                nombre:
                  'BBVA ACTUALIZADO',
                sigla:
                  'BVA_NEW',
                clienteId: 201,
                estado: false,
              }
            ),
          /identificador del grupo seleccionado no es válido/i
        );
      }
    ),
  ]
);
