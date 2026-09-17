import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import type {
  SesionesBiCatalogs,
} from '../domain/sesionesBi.types';
import {
  changeSesionesBiCustomRange,
  changeSesionesBiOrder,
  changeSesionesBiReport,
  createSesionesBiFiltersState,
  isSesionesBiClientFilterDisabled,
  resolveSesionesBiPanelFilters,
} from './sesionesBiFilters.application';

const CATALOGS: SesionesBiCatalogs = {
  reports: [
    {
      id: 10,
      name: 'Sin cliente',
      requiresClientSelection: false,
    },
    {
      id: 20,
      name: 'Con cliente',
      requiresClientSelection: true,
    },
  ],
  users: [],
  clients: [],
  statuses: ['ACTIVA', 'CERRADA'],
};

export const suite = defineSuite(
  'sesionesBiFilters.application',
  [
    test(
      'crea el estado inicial con la ventana de siete días y primera página',
      () => {
        const state = createSesionesBiFiltersState('2026-09-15');
        const filters = resolveSesionesBiPanelFilters(
          state,
          new Date('2026-09-15T14:00:00Z')
        );

        assert.equal(state.preset, 'LAST_7_DAYS');
        assert.equal(state.page, 1);
        assert.equal(state.pageSize, 10);
        assert.equal(filters.pageSize, 10);
        assert.equal(filters.fromUtc, '2026-09-09T05:00:00.000Z');
        assert.equal(filters.toUtc, '2026-09-16T05:00:00.000Z');
      }
    ),
    test(
      'al cambiar reporte limpia cliente y reinicia paginación',
      () => {
        const state = {
          ...createSesionesBiFiltersState('2026-09-15'),
          clientId: 99,
          page: 4,
        };
        const changed = changeSesionesBiReport(state, 10);

        assert.equal(changed.reportId, 10);
        assert.equal(changed.clientId, null);
        assert.equal(changed.page, 1);
      }
    ),
    test(
      'normaliza un rango personalizado invertido sin dejar fechas inválidas',
      () => {
        const state = {
          ...createSesionesBiFiltersState('2026-09-15'),
          page: 3,
        };
        const changed = changeSesionesBiCustomRange(
          state,
          '2026-09-20',
          '2026-09-10'
        );

        assert.equal(changed.customFrom, '2026-09-20');
        assert.equal(changed.customTo, '2026-09-20');
        assert.equal(changed.page, 1);
      }
    ),
    test(
      'al cambiar el orden reinicia la paginación',
      () => {
        const state = {
          ...createSesionesBiFiltersState('2026-09-15'),
          page: 5,
        };
        const ordered = changeSesionesBiOrder(
          state,
          'tiempo_desc'
        );

        assert.equal(ordered.order, 'tiempo_desc');
        assert.equal(ordered.page, 1);
      }
    ),
    test(
      'deshabilita cliente solo cuando el reporte seleccionado no usa ese contexto',
      () => {
        assert.equal(
          isSesionesBiClientFilterDisabled(CATALOGS, 10),
          true
        );
        assert.equal(
          isSesionesBiClientFilterDisabled(CATALOGS, 20),
          false
        );
        assert.equal(
          isSesionesBiClientFilterDisabled(CATALOGS, null),
          false
        );
      }
    ),
  ]
);
