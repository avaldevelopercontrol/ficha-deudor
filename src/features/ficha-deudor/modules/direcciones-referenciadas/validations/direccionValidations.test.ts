import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../../../test/testHarness';
import type {
  DireccionEditFormData,
  DireccionFormData,
  DireccionReferenciada,
} from '../types/direccion.types';
import {
  DIRECCION_DUPLICADA_MESSAGE,
  validateDireccionEditForm,
  validateDireccionForm,
} from './direccionValidations';

const createForm = (
  overrides: Partial<DireccionFormData> = {}
): DireccionFormData => ({
  direccion: 'Av. Javier Prado 123',
  departamento: '15',
  provincia: '1501',
  distrito: '150130',
  refUbicacion: '1',
  comentario: '',
  llegoDeBase: false,
  tipoDeudor: 'TITULAR',
  ...overrides,
});

const createEditForm = (
  overrides: Partial<DireccionEditFormData> = {}
): DireccionEditFormData => ({
  ...createForm(),
  id: '10',
  nombreAval: '',
  estado: true,
  ...overrides,
});

const createExisting = (
  overrides: Partial<DireccionReferenciada> = {}
): DireccionReferenciada => ({
  id: '20',
  direccion: 'Calle Las Begonias 456',
  refUbicacion: 'DOMICILIO',
  tipoDeudor: 'TITULAR',
  nombre: 'DEUDOR',
  estado: 'ACTIVO',
  ...overrides,
});

export const suite = defineSuite('direccionValidations', [
  test('acepta una dirección completa dentro de los límites', () => {
    assert.deepEqual(validateDireccionForm(createForm()), {});
  }),
  test('valida campos obligatorios y longitudes antes de registrar', () => {
    const errors = validateDireccionForm(
      createForm({
        direccion: 'abc',
        departamento: '',
        provincia: '',
        distrito: '',
        comentario: 'x'.repeat(501),
      })
    );

    assert.match(errors.direccion, /mínimo 5/i);
    assert.ok(errors.departamento);
    assert.ok(errors.provincia);
    assert.ok(errors.distrito);
    assert.match(errors.comentario, /500/);
  }),
  test('detecta duplicados ignorando tildes, signos y mayúsculas', () => {
    const errors = validateDireccionForm(
      createForm({ direccion: 'CALLE las begónias, 456' }),
      [createExisting()]
    );

    assert.equal(
      errors.direccion,
      DIRECCION_DUPLICADA_MESSAGE
    );
  }),
  test('en edición excluye el registro actual pero detecta otro duplicado', () => {
    const current = createExisting({
      id: '10',
      direccion: 'Av. Javier Prado 123',
    });

    assert.deepEqual(
      validateDireccionEditForm(
        createEditForm(),
        [current]
      ),
      {}
    );

    const errors = validateDireccionEditForm(
      createEditForm(),
      [current, createExisting({ id: '11', direccion: 'AV JAVIER PRADO 123' })]
    );

    assert.equal(
      errors.direccion,
      DIRECCION_DUPLICADA_MESSAGE
    );
  }),
]);
