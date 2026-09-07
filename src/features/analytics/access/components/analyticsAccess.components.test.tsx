import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import { defineSuite, test } from '../../../../test/testHarness';

import { AnalyticsScopesEmpty } from './AnalyticsScopesEmpty';
import { CrmClientSelector } from './CrmClientSelector';

export const suite = defineSuite('Analytics access components', [
  test('no renderiza selector cuando solo existe una cartera autorizada', () => {
    const html = renderToStaticMarkup(
      <CrmClientSelector
        scopes={[{ crmClientId: 95, name: 'Cartera 95' }]}
        value={95}
        onChange={() => undefined}
      />
    );

    assert.equal(html, '');
  }),
  test('renderiza todas las carteras y usa fallback de nombre cuando falta label', () => {
    const html = renderToStaticMarkup(
      <CrmClientSelector
        scopes={[
          { crmClientId: 95, name: 'Principal' },
          { crmClientId: 120, name: '' },
        ]}
        value={95}
        onChange={() => undefined}
      />
    );

    assert.match(html, /Seleccionar cartera Analytics/);
    assert.match(html, />Principal</);
    assert.match(html, />Cartera 120</);
    assert.match(html, /value="95" selected=""/);
  }),
  test('mantiene un empty state explícito cuando no existen scopes', () => {
    const html = renderToStaticMarkup(<AnalyticsScopesEmpty />);

    assert.match(html, /Sin carteras analíticas disponibles/);
    assert.match(html, /no hay carteras Analytics configuradas/);
  }),
]);
