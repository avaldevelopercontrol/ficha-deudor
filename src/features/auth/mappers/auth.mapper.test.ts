import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../test/testHarness';
import { createLoginUsuarioApi } from '../../../test/factories/auth.factory';
import { mapUsuarioApiToUsuario } from './auth.mapper';

export const suite = defineSuite('auth.mapper', [
  test('normaliza el usuario recibido por la API', () => {
    const usuario = mapUsuarioApiToUsuario(
      createLoginUsuarioApi({
        cUsr_Nombres: '  Carlos  ',
        cUsr_ApePat: ' Ramírez ',
        cUsr_ApeMat: ' López ',
        cUsr_Login: ' cramirez ',
      })
    );

    assert.deepEqual(usuario, {
      id_usuario: '16068',
      nombre: 'Carlos',
      apellido: 'Ramírez López',
      username: 'cramirez',
      email: 'carlos@avalperu.pe',
      perfil: 'Administrador Base Datos',
      perfilId: 9,
    });
  }),
  test('usa los correos alternativos en el orden configurado', () => {
    const personal = mapUsuarioApiToUsuario(
      createLoginUsuarioApi({
        cUsr_Email: ' ',
        cUsr_EmailPersonal: ' personal@correo.pe ',
        cUsr_EmailProfile: 'perfil@correo.pe',
      })
    );
    const perfil = mapUsuarioApiToUsuario(
      createLoginUsuarioApi({
        cUsr_Email: '',
        cUsr_EmailPersonal: '',
        cUsr_EmailProfile: ' perfil@correo.pe ',
      })
    );

    assert.equal(personal.email, 'personal@correo.pe');
    assert.equal(perfil.email, 'perfil@correo.pe');
  }),
  test('usa el perfil alternativo cuando nid_perfil no está disponible', () => {
    const usuario = mapUsuarioApiToUsuario(
      createLoginUsuarioApi({
        nid_perfil: undefined as unknown as number,
        nId_PerfilGest: 2,
      })
    );

    assert.equal(usuario.perfilId, 2);
    assert.equal(usuario.perfil, 'Gestor Call');
  }),
  test('mantiene apellido y correo vacíos cuando la API no los informa', () => {
    const usuario = mapUsuarioApiToUsuario(
      createLoginUsuarioApi({
        cUsr_ApePat: '',
        cUsr_ApeMat: '',
        cUsr_Email: '',
        cUsr_EmailPersonal: '',
        cUsr_EmailProfile: '',
      })
    );

    assert.equal(usuario.apellido, '');
    assert.equal(usuario.email, '');
  }),
]);
