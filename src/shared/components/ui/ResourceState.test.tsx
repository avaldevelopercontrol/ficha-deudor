import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import { defineSuite, test } from '../../../test/testHarness';
import { ResourceState } from './ResourceState';

const render = (props: {
  isLoading?: boolean;
  error?: string | null;
  hasData?: boolean;
  preserveDataOnLoading?: boolean;
  preserveDataOnError?: boolean;
}) =>
  renderToStaticMarkup(
    <ResourceState
      isLoading={props.isLoading ?? false}
      error={props.error ?? null}
      hasData={props.hasData ?? true}
      onRetry={() => undefined}
      emptyMessage="Sin resultados"
      preserveDataOnLoading={props.preserveDataOnLoading}
      preserveDataOnError={props.preserveDataOnError}
    >
      <strong>Contenido existente</strong>
    </ResourceState>
  );

export const suite = defineSuite('ResourceState', [
  test('preserva datos existentes durante refresh por defecto', () => {
    const html = render({ isLoading: true, hasData: true });
    assert.match(html, /Contenido existente/);
    assert.doesNotMatch(html, /Cargando información/);
  }),
  test('permite ocultar datos existentes durante loading', () => {
    const html = render({
      isLoading: true,
      hasData: true,
      preserveDataOnLoading: false,
    });
    assert.match(html, /Cargando información/);
    assert.match(html, /loading-state__spinner/);
    assert.doesNotMatch(html, /Contenido existente/);
  }),
  test('permite que un consumidor priorice error sobre datos existentes', () => {
    const html = render({
      error: 'Backend no disponible',
      hasData: true,
      preserveDataOnError: false,
    });
    assert.match(html, /Backend no disponible/);
    assert.doesNotMatch(html, /Contenido existente/);
  }),
  test('renderiza empty state cuando no existe data', () => {
    const html = render({ hasData: false });
    assert.match(html, /Sin resultados/);
    assert.doesNotMatch(html, /Contenido existente/);
  }),
]);
