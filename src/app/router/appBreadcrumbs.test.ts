import assert from 'node:assert/strict';

import {
  ANALYTICS_ROUTES,
} from '@features/analytics/constants/analyticsRoutes.constants';

import {
  REPORTERIA_ROUTES,
  buildReporteriaBiRoute,
} from '@features/analytics/constants/reporteriaRoutes.constants';

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
  urlBI: null,
  image: null,
  permissions,
  children: [],
};

const powerBiReport: AuthorizedOption = {
  id: 26,
  code: 'mBackusCobranza',
  name: 'Backus Cobranza',
  description: 'Reporte Power BI.',
  icon: 'analytics',
  type: 4,
  parentId: 25,
  order: 1,
  route: null,
  urlBI: 'https://app.powerbi.com/view?r=demo',
  image: '/logos/backus.webp',
  permissions,
  children: [],
};

const reporteria: AuthorizedOption = {
  id: 25,
  code: 'mReporteria',
  name: 'Reportería',
  description: '',
  icon: 'client-reports',
  type: 3,
  parentId: 24,
  order: 2,
  route: REPORTERIA_ROUTES.ROOT,
  urlBI: null,
  image: null,
  permissions,
  children: [powerBiReport],
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
  urlBI: null,
  image: null,
  permissions,
  children: [portfolio, reporteria],
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
    test(
      'incluye el Power BI dinámico aunque no tenga ruta propia en el registry',
      () => {
        assert.equal(
          getAppBreadcrumb(
            buildReporteriaBiRoute(26),
            [businessIntelligence]
          ),
          'INTELIGENCIA DE NEGOCIO › REPORTERÍA › BACKUS COBRANZA'
        );
      }
    ),
  ]
);
