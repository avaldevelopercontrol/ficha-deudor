import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../../../test/testHarness';
import type {
  Email,
  EmailEditFormData,
  EmailFormData,
} from '../types/email.types';
import {
  EMAIL_DUPLICADO_MESSAGE,
  validateEmailEditForm,
  validateEmailForm,
} from './emailValidations';

const createForm = (
  overrides: Partial<EmailFormData> = {}
): EmailFormData => ({
  email: 'deudor@example.com',
  contacto: 'TITULAR',
  comentario: '',
  prioridad: '1',
  estado: true,
  status: '1',
  ...overrides,
});

const createEditForm = (
  overrides: Partial<EmailEditFormData> = {}
): EmailEditFormData => ({
  ...createForm(),
  id: '10',
  dFecRegistro: '2026-08-27T10:00:00',
  ...overrides,
});

const createExisting = (
  overrides: Partial<Email> = {}
): Email => ({
  id: '20',
  email: 'registrado@example.com',
  fechaActivacion: '2026-08-27',
  estado: 'ACTIVO',
  status: 'OPERATIVO',
  fuente: 'GESTIÓN',
  baseCliente: 'NO',
  contacto: 'TITULAR',
  prioridad: 1,
  comentario: '',
  ...overrides,
});

export const suite = defineSuite('emailValidations', [
  test('acepta un email operativo con los datos obligatorios', () => {
    assert.deepEqual(validateEmailForm(createForm()), {});
  }),
  test('rechaza formato inválido y campos obligatorios ausentes', () => {
    const errors = validateEmailForm(
      createForm({
        email: 'correo-invalido',
        contacto: ' ',
        prioridad: '',
        status: '',
      })
    );

    assert.match(errors.email, /formato/i);
    assert.ok(errors.contacto);
    assert.ok(errors.prioridad);
    assert.ok(errors.status);
  }),
  test('exige status operativo cuando el email está activo', () => {
    const errors = validateEmailForm(
      createForm({ status: '2' })
    );

    assert.match(errors.status, /Operativo/);
  }),
  test('detecta duplicados sin distinguir espacios ni mayúsculas', () => {
    const errors = validateEmailForm(
      createForm({ email: ' REGISTRADO@EXAMPLE.COM ' }),
      [createExisting()]
    );

    assert.equal(errors.email, EMAIL_DUPLICADO_MESSAGE);
  }),
  test('en edición exige ID y excluye el registro actual del duplicado', () => {
    const current = createExisting({
      id: '10',
      email: 'deudor@example.com',
    });

    assert.deepEqual(
      validateEmailEditForm(
        createEditForm(),
        [current]
      ),
      {}
    );

    const errors = validateEmailEditForm(
      createEditForm({ id: '' }),
      []
    );

    assert.match(errors.id, /obligatorio/i);
  }),
]);
