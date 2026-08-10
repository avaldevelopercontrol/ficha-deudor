import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../../../test/testHarness';
import { createDocumento, createFichaParams, createGestionForm } from '../../../../../test/factories/fichaGestion.factory';
import { buildGestionSaveRequest } from './fichaGestionGuardar.service';

export const suite = defineSuite('flujo de preparación para guardar gestión', [
  test('detiene el flujo cuando no existen documentos', () => {
    const result = buildGestionSaveRequest({
      form: createGestionForm(), params: createFichaParams(), documentosFiltrados: [],
      np1TipoContacto: 1, requiereCamposClaro: true,
      fechaFinGestion: '2026-08-04T09:17:00.000',
    });
    assert.equal(result.isValid, false);
    assert.ok(result.validationErrors.documentos);
    assert.equal('payload' in result, false);
  }),
  test('produce el payload cuando la gestión es válida', () => {
    const result = buildGestionSaveRequest({
      form: createGestionForm(), params: createFichaParams(),
      documentosFiltrados: [createDocumento(101), createDocumento(202)],
      np1TipoContacto: 1, requiereCamposClaro: true,
      fechaFinGestion: '2026-08-04T09:17:00.000',
    });
    assert.equal(result.isValid, true);
    if (!result.isValid) throw new Error('Se esperaba una solicitud válida.');
    assert.equal(result.payload.nId_DocxCobrars, '101,202');
    assert.equal(result.payload.nId_PersDeudor, 3);
  }),
]);
