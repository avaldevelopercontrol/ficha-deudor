import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  getApplicationOptionDefinition,
  getOptionRoute,
  getRegistrableApplicationOptions,
  hasRegisteredOptionRoute,
} from './optionRoute.registry';

export const suite = defineSuite(
  'optionRoute.registry',
  [
    test(
      'resuelve las rutas de las opciones implementadas',
      () => {
        assert.equal(
          getOptionRoute(
            'mGestionDeudor'
          ),
          '/gestion-cobranzas/gestion-deudor'
        );

        assert.equal(
          getOptionRoute(
            'mMantenerAccesosPorPerfil'
          ),
          '/seguridad/mantener-accesos-por-perfil'
        );

        assert.equal(
          getOptionRoute(
            'mMantenerGrupo'
          ),
          '/seguridad/mantener-grupo'
        );
      }
    ),
    test(
      'expone metadatos de las pantallas registrables',
      () => {
        const mantenerGrupo =
          getApplicationOptionDefinition(
            'mMantenerGrupo'
          );

        assert.equal(
          mantenerGrupo?.name,
          'Mantener Grupo'
        );
        assert.equal(
          mantenerGrupo?.parentCode,
          'mSeguridad'
        );
        assert.equal(
          mantenerGrupo?.icon,
          'groups'
        );
        assert.equal(
          getRegistrableApplicationOptions().some(
            (option) =>
              option.code ===
              'mMantenerGrupo'
          ),
          true
        );
      }
    ),
    test(
      'rechaza códigos vacíos o sin pantalla registrada',
      () => {
        assert.equal(
          getOptionRoute(''),
          null
        );
        assert.equal(
          hasRegisteredOptionRoute(
            'mModuloFuturo'
          ),
          false
        );
      }
    ),
  ]
);
