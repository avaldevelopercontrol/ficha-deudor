import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  buildCreatePerfilRequest,
} from './crearPerfil.mapper';

export const suite = defineSuite(
  'crearPerfil.mapper',
  [
    test(
      'registra la fecha del perfil con la hora reloj de Perú',
      () => {
        const request =
          buildCreatePerfilRequest(
            {
              nombrePerfil:
                'Administrador',
              abreviatura: 'ADM',
              estado: 1,
            },
            new Date(
              '2026-08-05T16:20:00.250Z'
            )
          );

        assert.equal(
          request.per_Fecha,
          '2026-08-05T11:20:00.250'
        );
      }
    ),
  ]
);
