import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../../../test/testHarness';
import type {
  DireccionEditFormData,
  DireccionFormData,
} from '../types/direccion.types';
import {
  buildCreateDireccionRequest,
  buildUpdateDireccionRequest,
} from './direccionesReferenciadas.mapper';

const createForm = (
  overrides: Partial<DireccionFormData> = {}
): DireccionFormData => ({
  direccion: 'Av. Principal 123',
  departamento: '15',
  provincia: '1501',
  distrito: '150101',
  refUbicacion: '',
  comentario: '',
  llegoDeBase: false,
  tipoDeudor: 'TITULAR',
  ...overrides,
});

export const suite = defineSuite('direccionesReferenciadas.mapper', [
  test('mantiene cero solo para la referencia de ubicación opcional', () => {
    const request = buildCreateDireccionRequest(
      '1',
      '3',
      '5',
      createForm(),
      new Date('2026-08-04T14:00:00.000Z')
    );

    assert.equal(request.nId_Cliente, 1);
    assert.equal(request.nId_PersDeudor, 3);
    assert.equal(request.nid_usuarioUpd, 5);
    assert.equal(request.nId_PersRefUbi, 0);
    assert.equal(request.nId_Departamento, 15);
    assert.equal(request.dFec_Actualizacion, '2026-08-04T09:00:00.000');
  }),
  test('rechaza ubigeos inválidos antes de enviar la solicitud', () => {
    assert.throws(
      () => buildCreateDireccionRequest(
        '1',
        '3',
        '5',
        createForm({ distrito: 'texto' })
      ),
      /nId_Distrito/
    );
  }),
  test('valida el identificador de dirección al actualizar', () => {
    const editForm: DireccionEditFormData = {
      ...createForm(),
      id: '9',
      nombreAval: '',
      estado: true,
    };

    const request = buildUpdateDireccionRequest(
      '1',
      '3',
      '5',
      '9',
      editForm,
      new Date('2026-08-04T14:00:00.000Z')
    );

    assert.equal(request.nId_PersDirecc, 9);
    assert.equal(request.dFec_Actualizacion, '2026-08-04T09:00:00.000');

    assert.throws(
      () => buildUpdateDireccionRequest(
        '1',
        '3',
        '5',
        '-1',
        editForm
      ),
      /nId_PersDirecc/
    );
  }),
]);
