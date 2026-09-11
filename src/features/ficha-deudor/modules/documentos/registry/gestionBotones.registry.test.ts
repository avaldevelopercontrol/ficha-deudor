import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import { isGestionBotonImplemented } from './gestionBotones.registry';

export const suite = defineSuite('gestionBotones.registry', [
  test('reconoce los nombres técnicos actualmente implementados', () => {
    assert.equal(isGestionBotonImplemented('estadoCuenta'), true);
    assert.equal(isGestionBotonImplemented('pagos'), true);
    assert.equal(isGestionBotonImplemented('email'), true);
    assert.equal(isGestionBotonImplemented('agendas'), true);
    assert.equal(isGestionBotonImplemented('informacionDeudor'), true);
  }),
  test('un botón nuevo queda disponible para el fallback de módulo en construcción', () => {
    assert.equal(isGestionBotonImplemented('nuevoModulo'), false);
  }),
]);
