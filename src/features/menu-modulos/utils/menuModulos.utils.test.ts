import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import type {
  AuthorizedOption,
} from '@features/access-control';

import {
  buildMenuModulos,
} from './menuModulos.utils';

const permissions = {
  consultar: true,
  insertar: false,
  editar: false,
  eliminar: false,
  exportar: false,
} as const;

const option = (
  overrides: Partial<AuthorizedOption> &
    Pick<AuthorizedOption, 'id' | 'name'>
): AuthorizedOption => ({
  id: overrides.id,
  code:
    overrides.code ??
    `m${overrides.name.replace(/\s+/g, '')}`,
  name: overrides.name,
  description:
    overrides.description ?? '',
  urlBI: overrides.urlBI ?? null,
  image: overrides.image ?? null,
  icon: overrides.icon ?? 'analytics',
  type: overrides.type ?? 3,
  parentId: overrides.parentId ?? 1,
  order: overrides.order ?? 1,
  route: overrides.route ?? null,
  permissions:
    overrides.permissions ?? permissions,
  children: overrides.children ?? [],
});

export const suite = defineSuite(
  'menuModulos.utils',
  [
    test(
      'oculta los Power BI del menú general y deja Reportería como acceso directo',
      () => {
        const americatel = option({
          id: 26,
          name: 'AMERICATEL',
          parentId: 25,
          urlBI:
            'https://app.powerbi.com/view?r=americatel',
        });

        const reporteria = option({
          id: 25,
          name: 'Reportería',
          parentId: 24,
          route: '/analytics/reporteria',
          children: [americatel],
        });

        const gestionAnalitica = option({
          id: 24,
          name: 'Gestión Analítica',
          type: 2,
          parentId: 1,
          children: [reporteria],
        });

        const result = buildMenuModulos([
          gestionAnalitica,
        ]);

        const reporteriaMenu =
          result[0]?.children?.[0];

        assert.equal(
          reporteriaMenu?.label,
          'Reportería'
        );
        assert.equal(
          reporteriaMenu?.path,
          '/analytics/reporteria'
        );
        assert.equal(
          reporteriaMenu?.children,
          undefined
        );
        assert.equal(
          reporteriaMenu?.badge,
          'Disponible'
        );
      }
    ),
    test(
      'mantiene visibles como Próximamente las opciones normales sin implementación',
      () => {
        const pending = option({
          id: 30,
          name: 'Opción futura',
        });

        const result = buildMenuModulos([
          pending,
        ]);

        assert.equal(
          result[0]?.label,
          'Opción futura'
        );
        assert.equal(
          result[0]?.badge,
          'Próximamente'
        );
        assert.equal(
          result[0]?.isEnabled,
          false
        );
      }
    ),
    test(
      'no expone un Power BI aunque llegue como opción de primer nivel',
      () => {
        const report = option({
          id: 31,
          name: 'BI aislado',
          urlBI:
            'https://app.powerbi.com/view?r=demo',
        });

        assert.deepEqual(
          buildMenuModulos([report]),
          []
        );
      }
    ),
  ]
);
