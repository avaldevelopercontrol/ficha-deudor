import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  APPLICATION_OPTION_IDS,
} from './applicationOptionIds';

import {
  getApplicationOptionCatalog,
  getApplicationOptionDefinition,
  getOptionRoute,
  hasRegisteredOptionRoute,
} from './optionRoute.registry';

export const suite = defineSuite(
  'optionRoute.registry',
  [
    test(
      'resuelve las rutas por nId_Opcion y no por código o nombre',
      () => {
        assert.equal(
          getOptionRoute(
            APPLICATION_OPTION_IDS
              .GESTION_DEUDOR
          ),
          '/gestion-cobranzas/gestion-deudor'
        );

        assert.equal(
          getOptionRoute(
            APPLICATION_OPTION_IDS
              .PORTFOLIO_CONTROL_CENTER
          ),
          '/analytics/portfolio-control-center'
        );

        assert.equal(
          getOptionRoute(
            APPLICATION_OPTION_IDS
              .MANTENER_ACCESOS_POR_PERFIL
          ),
          '/seguridad/mantener-accesos-por-perfil'
        );

        assert.equal(
          getOptionRoute(
            APPLICATION_OPTION_IDS
              .MANTENER_ACCESOS_POR_USUARIO
          ),
          '/seguridad/mantener-accesos-por-usuario'
        );
      }
    ),
    test(
      'mantiene un identificador único por cada implementación React',
      () => {
        const catalog =
          getApplicationOptionCatalog();

        const ids = catalog.map(
          (definition) =>
            definition.optionId
        );

        assert.equal(
          new Set(ids).size,
          ids.length
        );

        assert.equal(
          getApplicationOptionDefinition(
            APPLICATION_OPTION_IDS
              .MANTENER_GRUPO
          )?.path,
          '/seguridad/mantener-grupo'
        );
      }
    ),
    test(
      'rechaza ids inválidos o sin pantalla registrada',
      () => {
        assert.equal(
          getOptionRoute(0),
          null
        );
        assert.equal(
          getOptionRoute(-1),
          null
        );
        assert.equal(
          hasRegisteredOptionRoute(9999),
          false
        );
      }
    ),
  ]
);
