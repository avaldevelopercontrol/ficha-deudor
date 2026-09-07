import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../../../test/testHarness';
import { formatAgendaPopupFecha } from './agendaDeudorPopup.utils';

export const suite = defineSuite('agendaDeudorPopup.utils', [
  test('usa fallback cuando no existe fecha', () => {
    assert.equal(formatAgendaPopupFecha(''), '—');
  }),
  test('conserva el texto original cuando la fecha es inválida', () => {
    assert.equal(formatAgendaPopupFecha('fecha-invalida'), 'fecha-invalida');
  }),
  test('formatea una fecha válida con día, mes y año', () => {
    const result = formatAgendaPopupFecha('2026-08-28T10:30:00');
    assert.match(result, /28\/08\/2026/);
  }),
]);
