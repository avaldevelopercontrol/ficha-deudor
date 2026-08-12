import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  buildResetearClaveUsuarioRequest,
} from './cambiarClave.mapper';

export const suite = defineSuite(
  'cambiarClave.mapper',
  [
    test(
      'construye exactamente el contrato de ResetearClaveUsuario',
      () => {
        const request = buildResetearClaveUsuarioRequest(
          {
            claveActual: 'Actual123!',
            claveNueva: 'Nueva456@',
            confirmarClaveNueva: 'Nueva456@',
          },
          '16068',
          new Date('2026-08-12T14:28:37.516Z')
        );

        assert.deepEqual(request, {
          nId_Usuario: 16068,
          cUsr_PassActual: 'Actual123!',
          cUsr_PassNueva: 'Nueva456@',
          cUsr_PassConfirma: 'Nueva456@',
          dFecRegistro: '2026-08-12T14:28:37.516Z',
        });
      }
    ),

    test(
      'rechaza un identificador de usuario inválido antes de llamar al backend',
      () => {
        assert.throws(
          () =>
            buildResetearClaveUsuarioRequest(
              {
                claveActual: 'Actual123!',
                claveNueva: 'Nueva456@',
                confirmarClaveNueva: 'Nueva456@',
              },
              '0'
            ),
          /nId_Usuario/
        );
      }
    ),
  ]
);
