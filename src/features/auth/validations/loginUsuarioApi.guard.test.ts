import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../test/testHarness';
import { createLoginUsuarioApi } from '../../../test/factories/auth.factory';
import { isLoginUsuarioApi } from './loginUsuarioApi.guard';

export const suite = defineSuite('loginUsuarioApi.guard', [
  test('acepta la identidad mínima válida utilizada por autenticación', () => {
    assert.equal(isLoginUsuarioApi(createLoginUsuarioApi()), true);
  }),
  test('rechaza identificadores y estados inválidos', () => {
    assert.equal(
      isLoginUsuarioApi(createLoginUsuarioApi({ nId_Usuario: 0 })),
      false
    );
    assert.equal(
      isLoginUsuarioApi({
        ...createLoginUsuarioApi(),
        bEstado: 'true',
      }),
      false
    );
  }),
  test('rechaza login vacío y campos de texto con tipos inesperados', () => {
    assert.equal(
      isLoginUsuarioApi(createLoginUsuarioApi({ cUsr_Login: '  ' })),
      false
    );
    assert.equal(
      isLoginUsuarioApi({
        ...createLoginUsuarioApi(),
        cUsr_Email: 123,
      }),
      false
    );
  }),
  test('rechaza valores nulos arreglos y objetos incompletos', () => {
    assert.equal(isLoginUsuarioApi(null), false);
    assert.equal(isLoginUsuarioApi([]), false);
    assert.equal(isLoginUsuarioApi({ nId_Usuario: 1 }), false);
  }),
]);
