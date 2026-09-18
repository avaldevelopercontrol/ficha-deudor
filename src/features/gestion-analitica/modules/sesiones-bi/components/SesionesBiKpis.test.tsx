import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import { defineSuite, test } from '../../../../../test/testHarness';
import { SesionesBiKpis } from './SesionesBiKpis';

export const suite = defineSuite('SesionesBiKpis', [
  test('usa la variante visual enriquecida compartida para todos los indicadores', () => {
    const html = renderToStaticMarkup(
      <SesionesBiKpis
        summary={{
          activeSessions: 3,
          totalSessions: 120,
          uniqueUsers: 18,
          visibleSeconds: 5400,
          averageSecondsPerSession: 45,
        }}
      />
    );

    assert.match(html, /Activas ahora/);
    assert.match(html, /Sesiones/);
    assert.match(html, /Usuarios únicos/);
    assert.match(html, /Tiempo visible/);
    assert.match(html, /Promedio \/ sesión/);
    assert.equal(
      (html.match(/analytics-kpi-card--stacked/g) ?? []).length,
      5
    );
    assert.match(html, /analytics-kpi-card--success/);
    assert.match(html, /analytics-kpi-card--info/);
    assert.match(html, /analytics-kpi-card--violet/);
    assert.match(html, /analytics-kpi-card--warning/);
  }),
]);
