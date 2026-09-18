import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import type { PowerBiReport } from '../domain/reporteria.types';
import {
  filterPowerBiReports,
  resolvePowerBiReportResultLabel,
  resolvePowerBiReportSelectionLabel,
  togglePowerBiReportSelection,
} from './usePowerBiReportFilter';

const buildReport = (id: number, name: string): PowerBiReport => ({
  id,
  code: `report-${id}`,
  name,
  description: '',
  serviceUrl: 'https://app.powerbi.com/view?r=demo',
  image: null,
  email: null,
  icon: 'analytics',
});

const REPORTS = [
  buildReport(1, 'Gestión América'),
  buildReport(2, 'Backus Cobranza'),
];

export const suite = defineSuite(
  'usePowerBiReportFilter helpers',
  [
    test('filtra reportes ignorando tildes y mayúsculas', () => {
      const result = filterPowerBiReports(REPORTS, 'america');

      assert.deepEqual(
        result.map((report) => report.id),
        [1]
      );
    }),
    test('resuelve la etiqueta de selección sin depender del componente', () => {
      assert.equal(
        resolvePowerBiReportSelectionLabel(REPORTS, []),
        'Todos los reportes'
      );
      assert.equal(
        resolvePowerBiReportSelectionLabel(REPORTS, [2]),
        'Backus Cobranza'
      );
      assert.equal(
        resolvePowerBiReportSelectionLabel(REPORTS, [1, 2]),
        '2 reportes seleccionados'
      );
    }),
    test('agrega y elimina reportes sin mutar la selección original', () => {
      const selected = [1];

      assert.deepEqual(togglePowerBiReportSelection(selected, 2), [1, 2]);
      assert.deepEqual(togglePowerBiReportSelection(selected, 1), []);
      assert.deepEqual(selected, [1]);
    }),
    test('mantiene el texto de resultados para selección global o parcial', () => {
      assert.equal(resolvePowerBiReportResultLabel(5, 0, 5), '5 reportes');
      assert.equal(
        resolvePowerBiReportResultLabel(5, 2, 3),
        '3 de 5 reportes'
      );
    }),
  ]
);
