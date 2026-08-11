import assert from 'node:assert/strict';
import {
  defineSuite,
  test,
} from '../../test/testHarness';
import { getOptionDisplayName } from './optionDisplayName.utils';

export const suite = defineSuite(
  'optionDisplayName.utils',
  [
    test('normaliza los nombres configurados por código de opción', () => {
      assert.equal(
        getOptionDisplayName(
          'mMantenerGrupo',
          'Mantener Grupo'
        ),
        'Mantener grupo'
      );

      assert.equal(
        getOptionDisplayName(
          'mMantenerAccesosPorUsuario',
          'Mantener Accesos por Usuario'
        ),
        'Mantener accesos por usuario'
      );
    }),
    test('conserva el nombre del backend para opciones sin corrección', () => {
      assert.equal(
        getOptionDisplayName(
          'mMantenerPerfil',
          ' Mantener perfil '
        ),
        'Mantener perfil'
      );
    }),
  ]
);
