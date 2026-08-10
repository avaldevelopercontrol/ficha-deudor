import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../test/testHarness';
import { isPublicAuthPath } from './logoutSession';

export const suite = defineSuite('logoutSession', [
  test('reconoce únicamente las rutas públicas de autenticación', () => {
    assert.equal(isPublicAuthPath('/'), true);
    assert.equal(isPublicAuthPath('/login'), true);
    assert.equal(isPublicAuthPath('/menu-modulos'), false);
    assert.equal(isPublicAuthPath('/gestion-cobranzas/gestion-deudor'), false);
  }),
]);
