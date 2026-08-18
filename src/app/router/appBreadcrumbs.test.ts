import assert from 'node:assert/strict';

import {
  ANALYTICS_ROUTES,
} from '@features/analytics/constants/analyticsRoutes.constants';

import type {
  AuthorizedOption,
} from '@features/access-control';

import {
  defineSuite,
  test,
} from '../../test/testHarness';

import {
  getAppBreadcrumb,
} from './appBreadcrumbs';

const permissions = {
  consultar: true,
  insertar: false,
  editar: false,
  eliminar: false,
  exportar: false,
};

const portfolio: AuthorizedOption = {
  id: 23,
  code: 'mPortfolioRenombrado',
  name: 'Portfolio renovado',
  description: '',
  icon: 'analytics',
  type: 3,
  parentId: 24,
  order: 1,
  route:
    ANALYTICS_ROUTES
      .PORTFOLIO_CONTROL_CENTER,
  permissions,
  children: [],
};

const businessIntelligence: AuthorizedOption = {
  id: 24,
  code: 'mInteligenciaDeNegocio',
  name: 'Inteligencia de Negocio',
  description: '',
  icon: 'general-reports',
  type: 2,
  parentId: 1,
  order: 9,
  route: null,
  permissions,
  children: [portfolio],
};

export const suite = defineSuite(
  'appBreadcrumbs',
  [
    test(
      'construye el breadcrumb desde la jerarquía vigente de la API',
      () => {
        assert.equal(
          getAppBreadcrumb(
            ANALYTICS_ROUTES
              .PORTFOLIO_CONTROL_CENTER,
            [businessIntelligence]
          ),
          'INTELIGENCIA DE NEGOCIO › PORTFOLIO RENOVADO'
        );
      }
    ),
  ]
);
