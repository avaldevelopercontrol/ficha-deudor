import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../../../test/testHarness';

import type {
  CambiarClaveFormData,
} from '../../../types/cambiarClave.types';

import {
  areCambiarClaveRequirementsMet,
  getCambiarClaveRequirementStatus,
  validateCambiarClaveForm,
} from './cambiarClave.validation';

const createForm = (
  overrides: Partial<CambiarClaveFormData> = {}
): CambiarClaveFormData => ({
  claveActual: 'ClaveAnterior1!',
  claveNueva: 'ClaveNueva2@',
  confirmarClaveNueva: 'ClaveNueva2@',
  ...overrides,
});

export const suite = defineSuite(
  'cambiarClave.validation',
  [
    test(
      'mantiene todos los requisitos pendientes mientras la nueva clave está vacía',
      () => {
        assert.deepEqual(
          getCambiarClaveRequirementStatus(''),
          {
            minLength: false,
            maxLength: false,
            hasLetter: false,
            hasNumber: false,
            hasSpecialCharacter: false,
          }
        );
      }
    ),

    test(
      'marca todos los requisitos como cumplidos para una clave válida',
      () => {
        const status =
          getCambiarClaveRequirementStatus('Clave12!');

        assert.deepEqual(status, {
          minLength: true,
          maxLength: true,
          hasLetter: true,
          hasNumber: true,
          hasSpecialCharacter: true,
        });
        assert.equal(
          areCambiarClaveRequirementsMet('Clave12!'),
          true
        );
      }
    ),

    test(
      'no considera los espacios como caracteres especiales',
      () => {
        const status =
          getCambiarClaveRequirementStatus('Clave 123');

        assert.equal(status.hasSpecialCharacter, false);
        assert.equal(
          areCambiarClaveRequirementsMet('Clave 123'),
          false
        );
      }
    ),

    test(
      'rechaza una nueva clave que excede los 20 caracteres',
      () => {
        const password = 'A1!' + 'x'.repeat(18);
        const status =
          getCambiarClaveRequirementStatus(password);

        assert.equal(password.length, 21);
        assert.equal(status.maxLength, false);
      }
    ),

    test(
      'valida los tres campos obligatorios',
      () => {
        const errors = validateCambiarClaveForm({
          claveActual: '',
          claveNueva: '',
          confirmarClaveNueva: '',
        });

        assert.equal(
          errors.claveActual,
          'Ingrese su clave actual.'
        );
        assert.equal(
          errors.claveNueva,
          'Ingrese una nueva clave.'
        );
        assert.equal(
          errors.confirmarClaveNueva,
          'Confirme su nueva clave.'
        );
      }
    ),

    test(
      'impide reutilizar la clave actual como nueva clave',
      () => {
        const errors = validateCambiarClaveForm(
          createForm({
            claveActual: 'Clave123!',
            claveNueva: 'Clave123!',
            confirmarClaveNueva: 'Clave123!',
          })
        );

        assert.equal(
          errors.claveNueva,
          'La nueva clave debe ser diferente de la clave actual.'
        );
      }
    ),

    test(
      'rechaza una confirmación diferente de la nueva clave',
      () => {
        const errors = validateCambiarClaveForm(
          createForm({
            confirmarClaveNueva: 'OtraClave3#',
          })
        );

        assert.equal(
          errors.confirmarClaveNueva,
          'La confirmación no coincide con la nueva clave.'
        );
      }
    ),

    test(
      'acepta el formulario cuando todos los requisitos se cumplen',
      () => {
        assert.deepEqual(
          validateCambiarClaveForm(createForm()),
          {}
        );
      }
    ),
  ]
);
