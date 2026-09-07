import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import { defineSuite, test } from '../../../../../test/testHarness';
import { PortfolioResourceState } from './PortfolioResourceState';

const render = (props: { isLoading: boolean; error: string | null; isEmpty: boolean }) =>
  renderToStaticMarkup(
    <PortfolioResourceState
      {...props}
      onRetry={() => undefined}
    >
      <strong>Contenido listo</strong>
    </PortfolioResourceState>
  );

export const suite = defineSuite('PortfolioResourceState', [
  test('prioriza loading sobre el resto de estados', () => {
    const html = render({ isLoading: true, error: 'fallo', isEmpty: true });
    assert.match(html, /Cargando indicadores/);
    assert.doesNotMatch(html, /fallo/);
    assert.doesNotMatch(html, /Contenido listo/);
  }),
  test('muestra error y acción de reintento', () => {
    const html = render({ isLoading: false, error: 'Backend no disponible', isEmpty: false });
    assert.match(html, /No se pudieron cargar los indicadores/);
    assert.match(html, /Backend no disponible/);
    assert.match(html, /Reintentar/);
  }),
  test('muestra empty state sin renderizar children', () => {
    const html = render({ isLoading: false, error: null, isEmpty: true });
    assert.match(html, /No hay información para los filtros seleccionados/);
    assert.doesNotMatch(html, /Contenido listo/);
  }),
  test('renderiza children cuando el recurso está listo', () => {
    const html = render({ isLoading: false, error: null, isEmpty: false });
    assert.match(html, /Contenido listo/);
  }),
]);
