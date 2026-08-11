import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../test/testHarness';
import { SEGURIDAD_ROUTES } from './seguridadRoutes.constants';
import { SEGURIDAD_SIDEBAR_ITEMS } from './seguridadSidebar.constants';

export const suite = defineSuite('seguridadSidebar.constants', [
  test('incluye los módulos de accesos dentro del menú lateral', () => {
    assert.deepEqual(SEGURIDAD_SIDEBAR_ITEMS, [
      {
        label: 'Mantener perfil',
        to: SEGURIDAD_ROUTES.MANTENER_PERFIL,
      },
      {
        label: 'Mantener módulo',
        to: SEGURIDAD_ROUTES.MANTENER_MODULOS,
      },
      {
        label: 'Mantener grupo',
        to: SEGURIDAD_ROUTES.MANTENER_GRUPO,
      },
      {
        label: 'Mantener accesos por perfil',
        to: SEGURIDAD_ROUTES.MANTENER_ACCESOS_PERFIL,
      },
      {
        label: 'Mantener accesos por usuario',
        to: SEGURIDAD_ROUTES.MANTENER_ACCESOS_USUARIO,
      },
    ]);
  }),
  test('mantiene rutas únicas para cada opción de seguridad', () => {
    const routes = SEGURIDAD_SIDEBAR_ITEMS.map((item) => item.to);

    assert.equal(new Set(routes).size, routes.length);
  }),
]);
