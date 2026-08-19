import assert from 'node:assert/strict';

import type {
  AuthorizedOption,
} from '@features/access-control';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import {
  filterPowerBiReports,
  findAuthorizedOptionById,
  getAuthorizedPowerBiReports,
  resolvePowerBiEmbedUrl,
  resolveReportImageSource,
} from './reporteria.utils';

const permissions = {
  consultar: true,
  insertar: false,
  editar: false,
  eliminar: false,
  exportar: false,
};

const buildOption = (
  overrides: Partial<AuthorizedOption>
): AuthorizedOption => ({
  id: 26,
  code: 'mBackusCobranza',
  name: 'Backus Cobranza',
  description: 'Seguimiento de cobranza.',
  urlBI: 'https://app.powerbi.com/view?r=demo',
  image: '/logos/backus.webp',
  email: 'ngutierrez@avalperu.com',
  icon: 'analytics',
  type: 4,
  parentId: 25,
  order: 1,
  route: null,
  permissions,
  children: [],
  ...overrides,
});

const report = buildOption({});
const withoutPermission = buildOption({
  id: 27,
  code: 'mNoAutorizado',
  name: 'Sin acceso',
  permissions: {
    ...permissions,
    consultar: false,
  },
});
const notBi = buildOption({
  id: 28,
  code: 'mNormal',
  name: 'Módulo normal',
  urlBI: null,
});

const reporteria = buildOption({
  id: 25,
  code: 'mReporteria',
  name: 'Reportería',
  description: '',
  urlBI: null,
  image: null,
  icon: 'client-reports',
  type: 3,
  parentId: 24,
  route: '/analytics/reporteria',
  children: [report, withoutPermission, notBi],
});

const gestionAnalitica = buildOption({
  id: 24,
  code: 'mGestionAnalitica',
  name: 'Gestión Analítica',
  description: '',
  urlBI: null,
  image: null,
  icon: 'general-reports',
  type: 2,
  parentId: 1,
  route: null,
  children: [reporteria],
});

export const suite = defineSuite(
  'reporteria.utils',
  [
    test(
      'obtiene solo Power BI directos y autorizados debajo de Reportería',
      () => {
        assert.deepEqual(
          getAuthorizedPowerBiReports([
            gestionAnalitica,
          ]).map((item) => item.id),
          [26]
        );
      }
    ),
    test(
      'busca reportes por nombre o descripción',
      () => {
        assert.equal(
          filterPowerBiReports(
            [report],
            'cobranza'
          ).length,
          1
        );
        assert.equal(
          filterPowerBiReports(
            [report],
            'inexistente'
          ).length,
          0
        );
      }
    ),
    test(
      'resuelve el reporte por Id y rechaza esquemas inseguros',
      () => {
        assert.equal(
          findAuthorizedOptionById(
            [gestionAnalitica],
            26
          )?.name,
          'Backus Cobranza'
        );
        assert.equal(
          resolvePowerBiEmbedUrl(
            'javascript:alert(1)'
          ),
          null
        );
        assert.match(
          resolvePowerBiEmbedUrl(
            'https://app.powerbi.com/view?r=demo'
          ) ?? '',
          /^https:\/\/app\.powerbi\.com\//
        );
        assert.equal(
          resolveReportImageSource('/logos/backus.webp'),
          '/logos/backus.webp'
        );
        assert.equal(
          resolveReportImageSource('javascript:alert(1)'),
          null
        );
      }
    ),
  ]
);
