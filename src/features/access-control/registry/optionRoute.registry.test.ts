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
  getOptionPopupType,
  getOptionRoute,
  hasRegisteredOptionDestination,
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
              .ANALISIS_CARTERAS
          ),
          '/gestion-analitica/analisis-carteras'
        );

        assert.equal(
          getOptionRoute(
            APPLICATION_OPTION_IDS
              .REPORTERIA
          ),
          '/gestion-analitica/reporteria'
        );

        assert.equal(
          getOptionRoute(
            APPLICATION_OPTION_IDS
              .SESIONES_BI
          ),
          '/gestion-analitica/sesiones-bi'
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
      'registra Producción online como destino popup sin inventar una ruta React',
      () => {
        assert.equal(
          getOptionRoute(
            APPLICATION_OPTION_IDS
              .PRODUCCION_ONLINE
          ),
          null
        );
        assert.equal(
          getOptionPopupType(
            APPLICATION_OPTION_IDS
              .PRODUCCION_ONLINE
          ),
          'produccion-online'
        );
        assert.equal(
          hasRegisteredOptionDestination(
            APPLICATION_OPTION_IDS
              .PRODUCCION_ONLINE
          ),
          true
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
        assert.equal(
          getOptionPopupType(9999),
          null
        );
        assert.equal(
          hasRegisteredOptionDestination(9999),
          false
        );
      }
    ),
  ]
);
