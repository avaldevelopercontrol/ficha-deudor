import assert from 'node:assert/strict';

import type {
  AuthorizedOption,
} from '@features/access-control/types/accessControl.types';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import {
  adaptAccessControlToReporteriaCatalog,
} from './accessControlReporteria.adapter';

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
  name: 'Sin acceso',
  permissions: {
    ...permissions,
    consultar: false,
  },
});
const withoutUrl = buildOption({
  id: 28,
  name: 'Pendiente de URL',
  urlBI: null,
});
const nestedReport = buildOption({
  id: 29,
  name: 'Anidado',
  parentId: 26,
});

const reporteria = buildOption({
  id: 25,
  code: 'mReporteria',
  name: 'Reportería',
  description: 'Reportes analíticos.',
  urlBI: null,
  image: null,
  icon: 'client-reports',
  type: 3,
  parentId: 24,
  route: '/analytics/reporteria',
  children: [
    {
      ...report,
      children: [nestedReport],
    },
    withoutPermission,
    withoutUrl,
  ],
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
  'accessControlReporteria.adapter',
  [
    test(
      'traduce access-control a un catálogo propio sin filtrar reglas de URL',
      () => {
        const catalog =
          adaptAccessControlToReporteriaCatalog([
            gestionAnalitica,
          ]);

        assert.deepEqual(catalog.section, {
          id: 25,
          name: 'Reportería',
          description: 'Reportes analíticos.',
          parentId: 24,
        });
        assert.equal(
          catalog.parentName,
          'Gestión Analítica'
        );
        assert.deepEqual(
          catalog.reports.map((item) => item.id),
          [26, 28]
        );
        assert.deepEqual(catalog.reports[0], {
          id: 26,
          code: 'mBackusCobranza',
          name: 'Backus Cobranza',
          description: 'Seguimiento de cobranza.',
          serviceUrl:
            'https://app.powerbi.com/view?r=demo',
          image: '/logos/backus.webp',
          email: 'ngutierrez@avalperu.com',
          icon: 'analytics',
        });
      }
    ),
    test(
      'devuelve un catálogo vacío cuando Reportería no existe',
      () => {
        assert.deepEqual(
          adaptAccessControlToReporteriaCatalog([]),
          {
            section: null,
            parentName: null,
            reports: [],
          }
        );
      }
    ),
  ]
);
