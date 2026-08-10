import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../../../test/testHarness';
import {
  createFichaParams,
  createGestionForm,
  NP1_OPTIONS,
  NP2_OPTIONS,
} from '../../../../../test/factories/fichaGestion.factory';
import { buildCreateAgendaPayload } from './fichaGestionAgenda.mapper';

export const suite = defineSuite('fichaGestionAgenda.mapper', [
  test('envía las fechas de agenda como hora local de Perú sin sufijo UTC', () => {
    const payload = buildCreateAgendaPayload({
      form: createGestionForm({
        fechaNuevaGestion: '2026-08-05',
        horaNuevaGestion: '10:30',
      }),
      params: createFichaParams(),
      deudorNombre: 'Deudor Uno',
      carteraNombre: 'Cartera Uno',
      np1Options: NP1_OPTIONS,
      np2Options: NP2_OPTIONS,
      registrationDate: new Date(
        '2026-08-04T14:17:32.456Z'
      ),
    });

    assert.equal(
      payload.dFechNuevaGestion,
      '2026-08-05T10:30:00.000'
    );
    assert.equal(
      payload.dFecRegistro,
      '2026-08-04T09:17:32.456'
    );
  }),
  test('rechaza fechas calendario imposibles antes de construir el payload', () => {
    assert.throws(
      () => buildCreateAgendaPayload({
        form: createGestionForm({
          fechaNuevaGestion: '2026-02-30',
          horaNuevaGestion: '10:30',
        }),
        params: createFichaParams(),
        deudorNombre: 'Deudor Uno',
        carteraNombre: 'Cartera Uno',
        np1Options: NP1_OPTIONS,
        np2Options: NP2_OPTIONS,
      }),
      /fecha y hora no son válidas/
    );
  }),
]);
