import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import { defineSuite, test } from '../../../test/testHarness';
import { SearchableSelectField } from './SearchableSelectField';
import {
  filterSearchableSelectOptions,
  normalizeSearchableSelectText,
} from './searchableSelectField.utils';

const options = [
  { id: '1', label: 'CONTACTÓ TITULAR' },
  { id: '2', label: 'NO CONTESTÓ' },
  { id: '3', label: 'PROMESA DE PAGO' },
] as const;

export const suite = defineSuite('SearchableSelectField', [
  test('normaliza búsqueda ignorando mayúsculas y tildes', () => {
    assert.equal(normalizeSearchableSelectText('  No Contestó  '), 'no contesto');
    assert.deepEqual(
      filterSearchableSelectOptions(options, 'contesto').map((option) => option.id),
      ['2']
    );
  }),

  test('renderiza una sola selección conservando el estilo de form-select', () => {
    const html = renderToStaticMarkup(
      <SearchableSelectField
        label="Estado de Gestión"
        options={[...options]}
        value="3"
        onChange={() => undefined}
        placeholder="Seleccionar estado..."
      />
    );

    assert.match(html, /role="combobox"/);
    assert.match(html, /form-select--has-value/);
    assert.match(html, /PROMESA DE PAGO/);
    assert.doesNotMatch(html, /type="checkbox"/);
  }),
]);
