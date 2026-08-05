import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../test/testHarness';
import {
  SISGES_ICON_CATALOG,
  SISGES_ICON_NAMES,
  getSisgesIconDefinition,
  normalizeSisgesIconName,
  searchSisgesIcons,
} from './index';

export const suite = defineSuite('sisgesIcon.utils', [
  test('conserva todas las claves existentes de menu-modulos', () => {
    const existingNames = [
      'database',
      'dollar-sign',
      'users',
      'bar-chart',
      'file-text',
      'smartphone',
      'monitor',
      'briefcase',
      'target',
      'mail',
      'phone',
      'user',
      'key',
      'shield',
    ];

    for (const name of existingNames) {
      assert.equal(SISGES_ICON_NAMES.includes(name as never), true);
      assert.equal(getSisgesIconDefinition(name).legacy, true);
    }
  }),
  test('normaliza aliases antiguos sin perder compatibilidad', () => {
    assert.equal(normalizeSisgesIconName('/candado.ico'), 'shield');
    assert.equal(normalizeSisgesIconName('/datos.ico'), 'database');
    assert.equal(normalizeSisgesIconName('ICONO'), 'module-default');
    assert.equal(normalizeSisgesIconName('no-existe'), 'module-default');
  }),
  test('no contiene claves duplicadas', () => {
    assert.equal(
      new Set(SISGES_ICON_CATALOG.map((icon) => icon.name)).size,
      SISGES_ICON_CATALOG.length
    );
  }),
  test('encuentra iconos por etiqueta y palabras clave', () => {
    assert.equal(
      searchSisgesIcons('reniec').some((icon) => icon.name === 'identity-search'),
      true
    );
    assert.equal(
      searchSisgesIcons('cobranza').some(
        (icon) => icon.name === 'collection-management'
      ),
      true
    );
  }),
]);
