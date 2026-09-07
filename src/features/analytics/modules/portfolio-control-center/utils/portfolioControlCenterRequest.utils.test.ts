import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';
import type {
  PortfolioControlCenterFilters,
} from '../../../types/portfolioControlCenter.types';
import {
  getPortfolioControlCenterResourceKey,
  resolvePortfolioControlCenterLoadMode,
} from './portfolioControlCenterRequest.utils';

const FILTERS: PortfolioControlCenterFilters = {
  businessUnit: 'CLARO ADMINISTRATIVO',
  dateFrom: '2026-08-01',
  dateTo: '2026-08-13',
  subPortfolioId: '10',
  campaignId: '2026-08',
  supervisorId: '1',
};

export const suite = defineSuite(
  'portfolioControlCenterRequest.utils',
  [
    test(
      'usa Bootstrap en la carga inicial y en un refresh explícito de filtros',
      () => {
        assert.equal(
          resolvePortfolioControlCenterLoadMode({
            filterOptionsLoaded: false,
            forceBootstrap: false,
            selectedBusinessUnit: null,
            requestedBusinessUnit: null,
          }),
          'bootstrap'
        );

        assert.equal(
          resolvePortfolioControlCenterLoadMode({
            filterOptionsLoaded: true,
            forceBootstrap: true,
            selectedBusinessUnit: 'CLARO ADMINISTRATIVO',
            requestedBusinessUnit: 'CLARO ADMINISTRATIVO',
          }),
          'bootstrap'
        );
      }
    ),
    test(
      'mantiene Overview cuando cambia un filtro dentro de la misma cartera',
      () => {
        assert.equal(
          resolvePortfolioControlCenterLoadMode({
            filterOptionsLoaded: true,
            forceBootstrap: false,
            selectedBusinessUnit: 'CLARO GOBIERNO',
            requestedBusinessUnit: ' claro gobierno ',
          }),
          'overview'
        );
      }
    ),
    test(
      'fuerza Bootstrap cuando la cartera solicitada cambia',
      () => {
        assert.equal(
          resolvePortfolioControlCenterLoadMode({
            filterOptionsLoaded: true,
            forceBootstrap: false,
            selectedBusinessUnit: 'CLARO ADMINISTRATIVO',
            requestedBusinessUnit: 'CLARO GOBIERNO',
          }),
          'bootstrap'
        );
      }
    ),
    test(
      'preserva compatibilidad legacy usando Overview cuando el filtro no repite la cartera resuelta',
      () => {
        assert.equal(
          resolvePortfolioControlCenterLoadMode({
            filterOptionsLoaded: true,
            forceBootstrap: false,
            selectedBusinessUnit: 'CLARO ADMINISTRATIVO',
            requestedBusinessUnit: null,
          }),
          'overview'
        );
      }
    ),
    test(
      'reintenta Bootstrap mientras la campaña actual no existe y usa Overview al elegir un histórico explícito',
      () => {
        assert.equal(
          resolvePortfolioControlCenterLoadMode({
            filterOptionsLoaded: true,
            forceBootstrap: false,
            selectedBusinessUnit: 'CLARO GOBIERNO',
            requestedBusinessUnit: 'CLARO GOBIERNO',
            currentCampaignUnavailable: true,
            requestedCampaignId: null,
          }),
          'bootstrap'
        );

        assert.equal(
          resolvePortfolioControlCenterLoadMode({
            filterOptionsLoaded: true,
            forceBootstrap: false,
            selectedBusinessUnit: 'CLARO GOBIERNO',
            requestedBusinessUnit: 'CLARO GOBIERNO',
            currentCampaignUnavailable: true,
            requestedCampaignId: '2026-08',
          }),
          'overview'
        );
      }
    ),
    test(
      'la clave del recurso separa Admin de Gobierno aun con los demás filtros idénticos',
      () => {
        const adminKey =
          getPortfolioControlCenterResourceKey(
            95,
            FILTERS
          );
        const governmentKey =
          getPortfolioControlCenterResourceKey(
            95,
            {
              ...FILTERS,
              businessUnit: 'CLARO GOBIERNO',
            }
          );

        assert.notDeepEqual(
          adminKey,
          governmentKey
        );
        assert.equal(
          adminKey[1],
          'CLARO ADMINISTRATIVO'
        );
        assert.equal(
          governmentKey[1],
          'CLARO GOBIERNO'
        );
      }
    ),
  ]
);
