import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../../../test/testHarness';
import type { TelefonoFormData } from '../types/telefono.types';
import {
  buildCreateTelefonoRequest,
  buildUpdateTelefonoRequest,
} from './telefonosReferenciados.mapper';

const createForm = (
  overrides: Partial<TelefonoFormData> = {}
): TelefonoFormData => ({
  id: 10,
  numero: '987654321',
  anexo: '',
  resultado: '1',
  operadorTelefonico: '2',
  ubicacion: '3',
  prioridad: '4',
  horarioGestion: '5',
  comentario: '',
  fuenteBusqueda: '6',
  referencia: 7,
  reclamoIndecopi: false,
  bEstado: true,
  dFecCarga_PersTelef: '2026-08-01T10:00:00.000Z',
  ...overrides,
});

export const suite = defineSuite('telefonosReferenciados.mapper', [
  test('construye el request con todos los identificadores requeridos', () => {
    const request = buildCreateTelefonoRequest(
      '3',
      '5',
      createForm(),
      new Date('2026-08-04T14:00:00.000Z')
    );

    assert.equal(request.nId_PersDeudor, 3);
    assert.equal(request.nid_usuarioupd, 5);
    assert.equal(request.nId_PersRefUbi, 3);
    assert.equal(request.nId_OperadorTelefonico, 2);
    assert.equal(request.nreferencia, 7);
    assert.equal(request.dFecUlt_PerstelefOpe, '2026-08-04T09:00:00.000');
    assert.equal(request.dFecCarga_PersTelef, '2026-08-04T09:00:00.000');
  }),
  test('conserva la fecha de carga como hora local de Perú al actualizar', () => {
    const request = buildUpdateTelefonoRequest(
      '3',
      '5',
      9,
      createForm(),
      new Date('2026-08-04T14:00:00.000Z')
    );

    assert.equal(
      request.dFecUlt_PerstelefOpe,
      '2026-08-04T09:00:00.000'
    );
    assert.equal(
      request.dFecCarga_PersTelef,
      '2026-08-01T05:00:00.000'
    );
  }),
  test('rechaza selecciones inválidas en lugar de enviarlas como cero', () => {
    assert.throws(
      () => buildCreateTelefonoRequest(
        '3',
        '5',
        createForm({ fuenteBusqueda: '' })
      ),
      /nId_Fuente/
    );
  }),
  test('rechaza un identificador de teléfono inválido al actualizar', () => {
    assert.throws(
      () => buildUpdateTelefonoRequest('3', '5', 0, createForm()),
      /nId_PersTelef/
    );
  }),
]);
