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
        per_Nombre: ' Administrador Base Datos      ',
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
  test('usa per_Nombre de la API y conserva el identificador alternativo del perfil', () => {
    const usuario = mapUsuarioApiToUsuario(
      createLoginUsuarioApi({
        per_Nombre: ' Gestor Call   ',
        nid_perfil: undefined,
        nId_PerfilGest: 2,
      })
    );

    assert.equal(usuario.perfilId, 2);
    assert.equal(usuario.perfil, 'Gestor Call');
  }),
  test('no infiere el nombre del perfil por id cuando la API no lo informa', () => {
    const usuario = mapUsuarioApiToUsuario(
      createLoginUsuarioApi({
        per_Nombre: '   ',
        nid_perfil: 9,
      })
    );

    assert.equal(usuario.perfilId, 9);
    assert.equal(usuario.perfil, 'Perfil no definido');
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
