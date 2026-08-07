import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  buildCreateGrupoRequest,
} from './crearGrupo.mapper';

export const suite = defineSuite(
  'crearGrupo.mapper',
  [
    test(
      'construye el payload esperado por POST /v1/Grupo',
      () => {
        assert.deepEqual(
          buildCreateGrupoRequest({
            nombre:
              '  Grupo Prueba  ',
            sigla:
              ' GP ',
            clienteId: 178,
            estado: true,
          }),
          {
            nId_Grupo: 0,
            cNombre_Grupo:
              'Grupo Prueba',
            cSigla_Grupo: 'GP',
            bEstado: true,
            nCant_Grupo: null,
            nid_cliente: 178,
          }
        );
      }
    ),
    test(
      'conserva correctamente el estado inactivo',
      () => {
        assert.equal(
          buildCreateGrupoRequest({
            nombre: 'Grupo',
            sigla: 'GR',
            clienteId: 1,
            estado: false,
          }).bEstado,
          false
        );
      }
    ),
  ]
);
