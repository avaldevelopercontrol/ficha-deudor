import assert from 'node:assert/strict';

import {
  renderToStaticMarkup,
} from 'react-dom/server';

import {
  defineSuite,
  test,
} from '../../../../../../test/testHarness';

import { PopupTableToolbar } from './PopupTableToolbar';

export const suite = defineSuite('PopupTableToolbar', [
  test('muestra el resumen de paginación por defecto', () => {
    const html = renderToStaticMarkup(
      <PopupTableToolbar
        indiceInicio={0}
        indiceFin={10}
        totalRecords={77}
        pageNumber={1}
        totalPages={8}
        countSuffix="registro(s)"
      />
    );

    assert.match(html, /Mostrando/);
    assert.match(html, /Página 1 de 8/);
    assert.doesNotMatch(
      html,
      /popup-toolbar--actions-only/
    );
  }),

  test('permite ocultar el resumen y conserva las acciones', () => {
    const html = renderToStaticMarkup(
      <PopupTableToolbar
        indiceInicio={0}
        indiceFin={10}
        totalRecords={77}
        pageNumber={1}
        totalPages={8}
        countSuffix="registro(s)"
        showInfo={false}
        actions={<button type="button">Ordenar</button>}
      />
    );

    assert.doesNotMatch(html, /Mostrando/);
    assert.doesNotMatch(html, /Página 1 de 8/);
    assert.match(html, /Ordenar/);
    assert.match(
      html,
      /popup-toolbar--actions-only/
    );
  }),
]);
