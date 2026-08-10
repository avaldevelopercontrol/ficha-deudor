import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../../../test/testHarness';
import { createFichaParams, createGestionForm, NP1_OPTIONS, NP2_OPTIONS, NP2_SIN_DATO_OPTIONS } from '../../../../../test/factories/fichaGestion.factory';
import { buildAgendaRequest } from './fichaGestionAgendar.service';

export const suite = defineSuite('flujo de preparación para agendar', [
  test('detiene el flujo ante datos incompletos', () => {
    const result = buildAgendaRequest({
      form: createGestionForm({ fechaNuevaGestion: '', horaNuevaGestion: '' }),
      params: createFichaParams(), deudorNombre: 'Deudor', carteraNombre: 'Cartera',
      np1Options: NP1_OPTIONS, np2Options: NP2_OPTIONS,
    });
    assert.equal(result.isValid, false);
    assert.ok(result.validationErrors.fechaNuevaGestion);
    assert.ok(result.validationErrors.horaNuevaGestion);
  }),
  test('usa NP1 cuando NP2 solo contiene SIN DATO', () => {
    const result = buildAgendaRequest({
      form: createGestionForm({ np2: '0', fechaNuevaGestion: '2099-08-11' }),
      params: createFichaParams(), deudorNombre: ' Deudor Uno ', carteraNombre: ' Cartera Uno ',
      np1Options: NP1_OPTIONS, np2Options: NP2_SIN_DATO_OPTIONS,
    });
    assert.equal(result.isValid, true);
    if (!result.isValid) throw new Error('Se esperaba una agenda válida.');
    assert.equal(result.payload.nId_TipoOpeCodCliOut, 1);
    assert.equal(result.payload.nId_OpeCodCliOut, 101);
    assert.equal(result.payload.nombre, 'Deudor Uno');
    assert.equal(result.payload.cartera, 'Cartera Uno');
  }),
  test('rechaza identificadores inválidos antes de crear la agenda', () => {
    assert.throws(() => buildAgendaRequest({
      form: createGestionForm({ fechaNuevaGestion: '2099-08-11' }),
      params: createFichaParams({ id_deudor: '0' }),
      deudorNombre: 'Deudor', carteraNombre: 'Cartera',
      np1Options: NP1_OPTIONS, np2Options: NP2_OPTIONS,
    }), /nid_PersDeudor/);
  }),
  test('rechaza una agenda sin nombre de deudor o cartera', () => {
    assert.throws(() => buildAgendaRequest({
      form: createGestionForm({ fechaNuevaGestion: '2099-08-11' }),
      params: createFichaParams(), deudorNombre: ' ', carteraNombre: 'Cartera',
      np1Options: NP1_OPTIONS, np2Options: NP2_OPTIONS,
    }), /nombre del deudor o la cartera/);
  }),
]);
