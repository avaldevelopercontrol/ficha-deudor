import assert from 'node:assert/strict';

import { defineSuite, test } from '../../../../../test/testHarness';
import { isAgendaApi } from './agendaApi.validators';

const validAgenda = {
  nid_agenda: 15,
  fechaNuevaGestion: '2026-08-28T10:30:00',
  tiempoVencido: '1 día',
  cartera: 'Cartera 2026',
  deudor: 'DEUDOR PRUEBA',
  respuestaOEstado: 'COMPROMISO',
  usuario: 'GESTOR 01',
};

export const suite = defineSuite('agendaApi.validators', [
  test('acepta el contrato completo de una agenda', () => {
    assert.equal(isAgendaApi(validAgenda), true);
  }),
  test('rechaza identificadores y campos descriptivos con tipos incompatibles', () => {
    assert.equal(isAgendaApi({ ...validAgenda, nid_agenda: '15' }), false);
    assert.equal(isAgendaApi({ ...validAgenda, usuario: null }), false);
  }),
]);
