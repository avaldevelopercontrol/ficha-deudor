import assert from 'node:assert/strict';
import { defineSuite, test } from '../../../../../test/testHarness';
import type {
  TelefonoFormData,
  TelefonoReferenciado,
} from '../types/telefono.types';
import {
  TELEFONO_DUPLICADO_MESSAGE,
  validateTelefonoEditForm,
  validateTelefonoForm,
} from './telefonoValidations';

const createForm = (
  overrides: Partial<TelefonoFormData> = {}
): TelefonoFormData => ({
  id: 0,
  numero: '987654321',
  anexo: '',
  resultado: '1',
  operadorTelefonico: '2',
  ubicacion: '3',
  prioridad: '1',
  horarioGestion: '4',
  comentario: '',
  fuenteBusqueda: '5',
  referencia: 1,
  reclamoIndecopi: false,
  bEstado: true,
  dFecCarga_PersTelef: '2026-08-27T10:00:00',
  ...overrides,
});

const createExisting = (
  overrides: Partial<TelefonoReferenciado> = {}
): TelefonoReferenciado => ({
  id: 20,
  prioridad: 1,
  numero: '912345678',
  horario: 'MAÑANA',
  refUbicacion: 'DOMICILIO',
  estado: 'ACTIVO',
  fechaEstado: '2026-08-27',
  fechaBase: '2026-08-27',
  contactados: '0',
  noContactados: 0,
  ivr: '0',
  fuente: 'GESTIÓN',
  ordenSearch: 1,
  anexo: '',
  operadorTelefonico: 'OPERADOR',
  referencia: 1,
  reclamoIndecopi: false,
  ...overrides,
});

export const suite = defineSuite('telefonoValidations', [
  test('acepta un teléfono completo y con formato permitido', () => {
    assert.deepEqual(validateTelefonoForm(createForm()), {});
  }),
  test('valida campos obligatorios, formato y límites de texto', () => {
    const errors = validateTelefonoForm(
      createForm({
        numero: 'abc123',
        resultado: '',
        operadorTelefonico: '',
        ubicacion: '',
        prioridad: '',
        horarioGestion: '',
        fuenteBusqueda: '',
        referencia: 0,
        anexo: '1'.repeat(11),
        comentario: 'x'.repeat(501),
      })
    );

    assert.match(errors.numero, /válido/i);
    assert.ok(errors.resultado);
    assert.ok(errors.operadorTelefonico);
    assert.ok(errors.ubicacion);
    assert.ok(errors.prioridad);
    assert.ok(errors.horarioGestion);
    assert.ok(errors.fuenteBusqueda);
    assert.ok(errors.referencia);
    assert.match(errors.anexo, /10/);
    assert.match(errors.comentario, /500/);
  }),
  test('detecta el mismo celular con o sin código de país', () => {
    const errors = validateTelefonoForm(
      createForm({ numero: '+51 912-345-678' }),
      [createExisting()]
    );

    assert.equal(
      errors.numero,
      TELEFONO_DUPLICADO_MESSAGE
    );
  }),
  test('en edición excluye el teléfono actual pero no otros registros', () => {
    const current = createExisting({
      id: 10,
      numero: '987654321',
    });

    assert.deepEqual(
      validateTelefonoEditForm(
        createForm({ id: 10 }),
        [current]
      ),
      {}
    );

    const errors = validateTelefonoEditForm(
      createForm({ id: 10 }),
      [current, createExisting({ id: 11, numero: '+51 987654321' })]
    );

    assert.equal(
      errors.numero,
      TELEFONO_DUPLICADO_MESSAGE
    );
  }),
]);
