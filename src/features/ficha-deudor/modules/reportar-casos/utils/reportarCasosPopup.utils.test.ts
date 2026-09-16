import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../../../test/testHarness';
import { formatReportarCasoFecha } from './reportarCasosPopup.utils';

export const suite = defineSuite('reportarCasosPopup.utils', [
  test('mantiene un valor inválido para no ocultar información del backend', () => {
    assert.equal(formatReportarCasoFecha('fecha-desconocida'), 'fecha-desconocida');
  }),
  test('usa fallback visual cuando la fecha está vacía', () => {
    assert.equal(formatReportarCasoFecha(''), '—');
  }),
]);
