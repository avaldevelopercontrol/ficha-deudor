import assert from 'node:assert/strict';
import {
  createRef,
} from 'react';
import {
  renderToStaticMarkup,
} from 'react-dom/server';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import type {
  UsuarioSearchOption,
} from '../utils/usuarioSearch.utils';

import UsuarioSearchDropdown from './UsuarioSearchDropdown';

const options: UsuarioSearchOption[] = [
  {
    id: 10,
    label: 'Ana Pérez',
    login: 'aperez',
    searchText: 'ana perez aperez 10',
    normalizedLabel: 'ana perez',
    normalizedLogin: 'aperez',
  },
  {
    id: 20,
    label: 'Bruno Soto',
    login: 'bsoto',
    searchText: 'bruno soto bsoto 20',
    normalizedLabel: 'bruno soto',
    normalizedLogin: 'bsoto',
  },
];

const renderDropdown = (
  visibleOptions: readonly UsuarioSearchOption[],
  overrides: Partial<{
    query: string;
    totalMatches: number;
    value: number | '';
    activeIndex: number;
    emptyMessage: string;
  }> = {}
): string =>
  renderToStaticMarkup(
    <UsuarioSearchDropdown
      dropdownRef={createRef<HTMLDivElement>()}
      listboxId="usuarios-listbox"
      position={{
        left: 10,
        top: 20,
        width: 340,
        maxHeight: 300,
      }}
      query={overrides.query ?? ''}
      resultSummary="Resumen"
      totalMatches={
        overrides.totalMatches ?? visibleOptions.length
      }
      visibleOptions={visibleOptions}
      value={overrides.value ?? ''}
      activeIndex={overrides.activeIndex ?? -1}
      emptyMessage={
        overrides.emptyMessage ?? 'Sin resultados'
      }
      onSelect={() => undefined}
      onActiveIndexChange={() => undefined}
    />
  );

export const suite = defineSuite(
  'UsuarioSearchDropdown',
  [
    test(
      'mantiene las clases de opción seleccionada y activa',
      () => {
        const html = renderDropdown(options, {
          value: 10,
          activeIndex: 1,
        });

        assert.match(
          html,
          /usuario-search-combobox__option--selected/
        );
        assert.match(
          html,
          /usuario-search-combobox__option--active/
        );
        assert.match(html, /Ana Pérez/);
        assert.match(html, /aperez/);
      }
    ),
    test(
      'conserva la ayuda de filtrado y el estado vacío',
      () => {
        const limitedHtml = renderDropdown(
          options,
          {
            totalMatches: 80,
          }
        );
        const emptyHtml = renderDropdown([], {
          query: 'nadie',
          totalMatches: 0,
          emptyMessage: 'No disponible',
        });

        assert.match(
          limitedHtml,
          /Escriba nombre o usuario para filtrar\./
        );
        assert.match(
          emptyHtml,
          /usuario-search-combobox__empty/
        );
        assert.match(emptyHtml, /No disponible/);
      }
    ),
  ]
);
