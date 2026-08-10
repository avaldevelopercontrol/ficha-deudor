import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  mapGrupo,
  mapGruposResponse,
} from './grupo.mapper';

export const suite = defineSuite(
  'grupo.mapper',
  [
    test(
      'normaliza el grupo recibido desde la API',
      () => {
        assert.deepEqual(
          mapGrupo({
            nId_Grupo: 219,
            cNombre_Grupo:
              ' ADEX INSTITUTO ',
            cSigla_Grupo:
              'ADEX INSTITUTO',
            bEstado: true,
            nCant_Grupo: 0,
            nid_cliente: 178,
            cCli_Nombre:
              ' ADEX INSTITUTO ',
          }),
          {
            idGrupo: 219,
            nombreGrupo:
              'ADEX INSTITUTO',
            cliente:
              'ADEX INSTITUTO',
            estado: 'Activo',
          }
        );
      }
    ),
    test(
      'admite una respuesta individual o nula',
      () => {
        const grupo = {
          nId_Grupo: 1,
          cNombre_Grupo: 'Grupo',
          cSigla_Grupo: 'GR',
          bEstado: false,
          nCant_Grupo: 0,
          nid_cliente: 1,
          cCli_Nombre: 'Cliente',
        };

        assert.equal(
          mapGruposResponse(
            grupo
          ).length,
          1
        );

        assert.deepEqual(
          mapGruposResponse(null),
          []
        );
      }
    ),
  ]
);
