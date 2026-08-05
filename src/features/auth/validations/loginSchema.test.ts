import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../test/testHarness';
import { hasErrors, validateLoginForm } from './loginSchema';

export const suite = defineSuite('loginSchema', [
  test('acepta credenciales con longitudes válidas', () => {
    assert.deepEqual(
      validateLoginForm({ username: ' usr ', password: '1234' }),
      {}
    );
  }),
  test('rechaza usuario y contraseña vacíos', () => {
    assert.deepEqual(
      validateLoginForm({ username: '   ', password: '' }),
      {
        username: 'El usuario es obligatorio',
        password: 'La contraseña es obligatoria',
      }
    );
  }),
  test('exige las longitudes mínimas configuradas', () => {
    assert.deepEqual(
      validateLoginForm({ username: 'ab', password: '123' }),
      {
        username: 'El usuario debe tener al menos 3 caracteres',
        password: 'La contraseña debe tener al menos 4 caracteres',
      }
    );
  }),
  test('detecta correctamente la presencia de errores', () => {
    assert.equal(hasErrors({}), false);
    assert.equal(hasErrors({ username: 'Error' }), true);
  }),
]);
