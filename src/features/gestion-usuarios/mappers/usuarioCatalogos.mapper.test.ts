import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  mapPerfilesToOptions,
} from './usuarioCatalogos.mapper';

export const suite = defineSuite(
  'usuarioCatalogos.mapper',
  [
    test(
      'solo expone perfiles activos y limpia sus nombres',
      () => {
        assert.deepEqual(
          mapPerfilesToOptions([
            {
              nid_perfil: 12,
              per_Nombre: 'Abogado   ',
              nEstadoGest: 1,
            },
            {
              nid_perfil: 31,
              per_Nombre: 'Cliente BITEL 1',
              nEstadoGest: 0,
            },
          ]),
          [
            {
              id: '12',
              label: 'Abogado',
            },
          ]
        );
      }
    ),
    test(
      'rechaza estados de perfil distintos de 0 o 1',
      () => {
        assert.throws(
          () =>
            mapPerfilesToOptions([
              {
                nid_perfil: 99,
                per_Nombre: 'Perfil inválido',
                nEstadoGest: 2,
              },
            ]),
          /estado del perfil/
        );
      }
    ),
  ]
);
