import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../test/testHarness';
import { buildLoginEndpoint, buildLoginQuery } from './loginRequest.utils';

export const suite = defineSuite('loginRequest.utils', [
  test('normaliza el usuario y conserva exactamente la contraseña', () => {
    const params = buildLoginQuery({
      username: '  usuario.prueba  ',
      password: ' clave con espacios ',
    });

    assert.equal(params.get('cUsr_Login'), 'usuario.prueba');
    assert.equal(params.get('cUsr_Pass'), ' clave con espacios ');
  }),
  test('codifica caracteres reservados al construir el endpoint GET vigente', () => {
    const endpoint = buildLoginEndpoint('/v1/Usuario/GetLoginUsuario', {
      username: 'usuario+qa',
      password: 'a&b=c?#',
    });
    const url = new URL(endpoint, 'http://localhost');

    assert.equal(url.pathname, '/v1/Usuario/GetLoginUsuario');
    assert.equal(url.searchParams.get('cUsr_Login'), 'usuario+qa');
    assert.equal(url.searchParams.get('cUsr_Pass'), 'a&b=c?#');
  }),
]);
