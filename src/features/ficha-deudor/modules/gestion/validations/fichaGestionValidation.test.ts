import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../../../test/testHarness';
import { createGestionForm } from '../../../../../test/factories/fichaGestion.factory';
import { TIPO_CONTACTO, TIPO_GESTION } from '../constants/fichaGestion.constants';
import { getFichaGestionErrorMessages, hasFichaGestionErrors, validateFichaGestion } from './fichaGestionValidation';

export const suite = defineSuite('validateFichaGestion', [
  test('acepta una gestión completa', () => {
    const errors = validateFichaGestion({
      form: createGestionForm(), np1TipoContacto: 1,
      tieneDocumentos: true, requiereCamposClaro: true,
    });
    assert.deepEqual(errors, {});
    assert.equal(hasFichaGestionErrors(errors), false);
  }),
  test('marca campos obligatorios y ausencia de documentos', () => {
    const errors = validateFichaGestion({
      form: createGestionForm({ np0: '', np1: '', estadoGestion: '', tipoGestion: '', observaciones: '', telefono: '' }),
      np1TipoContacto: 1, tieneDocumentos: false,
    });
    assert.ok(errors.documentos);
    assert.ok(errors.np0);
    assert.ok(errors.np1);
    assert.ok(errors.estadoGestion);
    assert.ok(errors.tipoGestion);
    assert.ok(errors.observaciones);
    assert.ok(errors.telefono);
  }),
  test('exige fecha y monto cuando NP1 representa compromiso', () => {
    const errors = validateFichaGestion({
      form: createGestionForm({ fechaCompromisoPago: '', compromisoSoles: '', compromisoUSD: '' }),
      np1TipoContacto: TIPO_CONTACTO.COMPROMISO,
      tieneDocumentos: true,
    });
    assert.ok(errors.fechaCompromisoPago);
    assert.ok(errors.montoCompromiso);
  }),
  test('no exige teléfono para gestión por email', () => {
    const errors = validateFichaGestion({
      form: createGestionForm({ telefono: '', tipoGestion: String(TIPO_GESTION.EMAIL) }),
      np1TipoContacto: 1, tieneDocumentos: true,
    });
    assert.equal(errors.telefono, undefined);
  }),
  test('elimina mensajes duplicados al construir el resumen', () => {
    assert.deepEqual(
      getFichaGestionErrorMessages({ np0: 'Error', np1: 'Error', telefono: 'Otro' }),
      ['Error', 'Otro']
    );
  }),
]);
