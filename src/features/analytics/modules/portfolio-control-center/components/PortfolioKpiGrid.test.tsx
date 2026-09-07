import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import { defineSuite, test } from '../../../../../test/testHarness';
import { PortfolioKpiGrid } from './PortfolioKpiGrid';

export const suite = defineSuite('PortfolioKpiGrid', [
  test('presenta las cuatro métricas principales con porcentajes derivados', () => {
    const html = renderToStaticMarkup(
      <PortfolioKpiGrid
        summary={{
          assignedPortfolio: 100,
          managedPortfolio: 40,
          pendingPortfolio: 60,
          managementCount: 8,
          managementIntensity: 20,
          recoveredAmount: 2500,
          contactabilityRate: 50,
          rpcRate: 30,
          closeRate: 10,
          promiseCount: 5,
          promiseFulfillmentRate: 70,
          paymentCount: 3,
        }}
      />
    );

    assert.match(html, /Cartera asignada/);
    assert.match(html, /Cartera gestionada/);
    assert.match(html, /40\.00% de la cartera/);
    assert.match(html, /Cartera pendiente/);
    assert.match(html, /60\.00% por gestionar/);
    assert.match(html, /Monto recuperado/);
    assert.match(html, /S\/.*2,500/);
  }),
]);
