import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { defineSuite, test } from '../../../../test/testHarness';
import FichaDeudorPageState from './FichaDeudorPageState';

export const suite = defineSuite('estados críticos de la página de ficha', [
  test('expone un estado accesible durante la carga', () => {
    const html = renderToStaticMarkup(
      <FichaDeudorPageState variant="loading" message="Cargando información..." />
    );
    assert.match(html, /role="status"/);
    assert.match(html, /aria-busy="true"/);
    assert.match(html, /Cargando información/);
  }),
  test('expone un alerta y la acción de reintento ante error', () => {
    const html = renderToStaticMarkup(
      <FichaDeudorPageState variant="error" message="No se pudo cargar" onRetry={() => undefined} />
    );
    assert.match(html, /role="alert"/);
    assert.match(html, /No se pudo cargar/);
    assert.match(html, />Reintentar</);
  }),
]);
