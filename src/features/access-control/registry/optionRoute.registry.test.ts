import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  getOptionRoute,
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
