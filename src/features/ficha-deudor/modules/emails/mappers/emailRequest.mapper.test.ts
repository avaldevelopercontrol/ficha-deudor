import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../../../test/testHarness';
import type {
  EmailEditFormData,
  EmailFormData,
} from '../types/email.types';
import {
  buildCreateEmailRequest,
  buildUpdateEmailRequest,
} from './emailRequest.mapper';

const createForm = (
  overrides: Partial<EmailFormData> = {}
): EmailFormData => ({
  email: 'deudor@example.com',
  contacto: 'Ana Torres',
  comentario: 'Correo principal',
  prioridad: '2',
  estado: true,
  status: '1',
  ...overrides,
});

export const suite = defineSuite('emailRequest.mapper', [
  test('construye solicitudes con identificadores numéricos válidos', () => {
    const currentDate = new Date('2026-08-04T14:00:00.000Z');
    const request = buildCreateEmailRequest(
      '1',
      '3',
      '5',
      createForm(),
      currentDate
    );

    assert.equal(request.nId_Cliente, 1);
    assert.equal(request.nId_PersDeudor, 3);
    assert.equal(request.nId_UsuarioAct, 5);
    assert.equal(request.nEmail_Prioridad, 2);
    assert.equal(request.nId_PersEmailOpe, 1);
    assert.equal(request.dFecRegistro, '2026-08-04T09:00:00.000');
    assert.equal(request.dFecActualizacion, '2026-08-04T09:00:00.000');
  }),
  test('rechaza identificadores principales inválidos', () => {
    assert.throws(
      () => buildCreateEmailRequest('abc', '3', '5', createForm()),
      /nId_Cliente/
    );
  }),
  test('rechaza prioridad y status inválidos antes de llamar a la API', () => {
    assert.throws(
      () => buildCreateEmailRequest('1', '3', '5', createForm({ prioridad: '0' })),
      /nEmail_Prioridad/
    );

    assert.throws(
      () => buildCreateEmailRequest('1', '3', '5', createForm({ status: 'texto' })),
      /nId_PersEmailOpe/
    );
  }),
  test('valida también el identificador durante la actualización', () => {
    const editForm: EmailEditFormData = {
      ...createForm(),
      id: '9',
      dFecRegistro: '2026-08-01T10:00:00.000Z',
    };

    const request = buildUpdateEmailRequest(
      '1',
      '3',
      '5',
      '9',
      editForm,
      editForm.dFecRegistro,
      new Date('2026-08-04T14:00:00.000Z')
    );

    assert.equal(request.nId_PersEmail, 9);
    assert.equal(request.dFecRegistro, '2026-08-01T05:00:00.000');
    assert.equal(request.dFecActualizacion, '2026-08-04T09:00:00.000');

    assert.throws(
      () => buildUpdateEmailRequest(
        '1',
        '3',
        '5',
        '0',
        editForm,
        editForm.dFecRegistro
      ),
      /nId_PersEmail/
    );

    assert.throws(
      () => buildUpdateEmailRequest(
        '1',
        '3',
        '5',
        '9',
        editForm,
        'fecha inválida'
      ),
      /dFecRegistro/
    );
  }),
]);
