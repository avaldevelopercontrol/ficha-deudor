import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../test/testHarness';
import { getPerfilUsuarioNombreById } from './perfilesUsuario.constants';

export const suite = defineSuite('perfilesUsuario.constants', [
  test('resuelve perfiles conocidos desde número o texto', () => {
    assert.equal(getPerfilUsuarioNombreById(9), 'Administrador Base Datos');
    assert.equal(getPerfilUsuarioNombreById('2'), 'Gestor Call');
  }),
  test('construye un nombre estable para perfiles desconocidos', () => {
    assert.equal(getPerfilUsuarioNombreById(999), 'Perfil 999');
  }),
  test('devuelve perfil no definido para valores vacíos o inválidos', () => {
    assert.equal(getPerfilUsuarioNombreById(null), 'Perfil no definido');
    assert.equal(getPerfilUsuarioNombreById(''), 'Perfil no definido');
    assert.equal(getPerfilUsuarioNombreById('abc'), 'Perfil no definido');
  }),
]);
