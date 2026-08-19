import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  matchesWithoutSidebarPath,
} from './appLayout.utils';

const ROUTES_WITHOUT_SIDEBAR = [
  '/menu-modulos',
  '/gestion-cobranzas/gestion-deudor/ficha-deudor',
  '/analytics/reporteria/bi/:optionId',
] as const;

export const suite = defineSuite(
  'appLayout.utils',
  [
    test(
      'oculta el sidebar en rutas estáticas configuradas',
      () => {
        assert.equal(
          matchesWithoutSidebarPath(
            '/menu-modulos',
            ROUTES_WITHOUT_SIDEBAR
          ),
          true
        );

        assert.equal(
          matchesWithoutSidebarPath(
            '/gestion-cobranzas/gestion-deudor/ficha-deudor',
            ROUTES_WITHOUT_SIDEBAR
          ),
          true
        );
      }
    ),
    test(
      'reconoce la ruta dinámica de cualquier visor Power BI',
      () => {
        assert.equal(
          matchesWithoutSidebarPath(
            '/analytics/reporteria/bi/26',
            ROUTES_WITHOUT_SIDEBAR
          ),
          true
        );

        assert.equal(
          matchesWithoutSidebarPath(
            '/analytics/reporteria',
            ROUTES_WITHOUT_SIDEBAR
          ),
          false
        );
      }
    ),
  ]
);
