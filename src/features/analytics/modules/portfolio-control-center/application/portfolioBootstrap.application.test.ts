import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import type {
  PortfolioControlCenterFilters,
} from '../domain/portfolioFilters.types';
import {
  createPortfolioBootstrapSession,
  getPortfolioControlCenterResourceKey,
  requestPortfolioBootstrap,
  resolvePortfolioControlCenterLoadMode,
} from './portfolioBootstrap.application';

const FILTERS: PortfolioControlCenterFilters = {
  businessUnit: 'CLARO ADMINISTRATIVO',
  dateFrom: '2026-08-01',
  dateTo: '2026-08-13',
  subPortfolioId: '10',
  campaignId: '2026-08',
  supervisorId: '1',
};

export const suite = defineSuite(
  'portfolioBootstrap.application',
  [
    test('usa Bootstrap en la carga inicial y tras un refresh explícito', () => {
      const session = createPortfolioBootstrapSession();

      assert.equal(
        resolvePortfolioControlCenterLoadMode(session, FILTERS),
        'bootstrap'
      );

      session.filterOptionsLoaded = true;
      session.selectedBusinessUnit = 'CLARO ADMINISTRATIVO';
      requestPortfolioBootstrap(session);

      assert.equal(
        resolvePortfolioControlCenterLoadMode(session, FILTERS),
        'bootstrap'
      );
    }),
    test('mantiene Overview al cambiar filtros dentro de la misma cartera', () => {
      const session = createPortfolioBootstrapSession();
      session.filterOptionsLoaded = true;
      session.selectedBusinessUnit = 'CLARO GOBIERNO';

      assert.equal(
        resolvePortfolioControlCenterLoadMode(session, {
          ...FILTERS,
          businessUnit: ' claro gobierno ',
        }),
        'overview'
      );
    }),
    test('fuerza Bootstrap cuando cambia la cartera solicitada', () => {
      const session = createPortfolioBootstrapSession();
      session.filterOptionsLoaded = true;
      session.selectedBusinessUnit = 'CLARO ADMINISTRATIVO';

      assert.equal(
        resolvePortfolioControlCenterLoadMode(session, {
          ...FILTERS,
          businessUnit: 'CLARO GOBIERNO',
        }),
        'bootstrap'
      );
    }),
    test('reintenta Bootstrap sin campaña actual y usa Overview al elegir un histórico', () => {
      const session = createPortfolioBootstrapSession();
      session.filterOptionsLoaded = true;
      session.selectedBusinessUnit = 'CLARO GOBIERNO';
      session.currentCampaignUnavailable = true;

      assert.equal(
        resolvePortfolioControlCenterLoadMode(session, {
          ...FILTERS,
          businessUnit: 'CLARO GOBIERNO',
          campaignId: null,
        }),
        'bootstrap'
      );
      assert.equal(
        resolvePortfolioControlCenterLoadMode(session, {
          ...FILTERS,
          businessUnit: 'CLARO GOBIERNO',
          campaignId: '2026-08',
        }),
        'overview'
      );
    }),
    test('la clave del recurso separa carteras con el resto de filtros idénticos', () => {
      const adminKey = getPortfolioControlCenterResourceKey(95, FILTERS);
      const governmentKey = getPortfolioControlCenterResourceKey(95, {
        ...FILTERS,
        businessUnit: 'CLARO GOBIERNO',
      });

      assert.notDeepEqual(adminKey, governmentKey);
      assert.equal(adminKey[1], 'CLARO ADMINISTRATIVO');
      assert.equal(governmentKey[1], 'CLARO GOBIERNO');
    }),
  ]
);
