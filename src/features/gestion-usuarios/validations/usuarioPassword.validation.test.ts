import assert from 'node:assert/strict';

import {
  defineSuite,
  test,
} from '../../../test/testHarness';

import {
  areUsuarioPasswordRequirementsMet,
  getUsuarioPasswordRequirementStatus,
} from './usuarioPassword.validation';

export const suite = defineSuite(
  'usuarioPassword.validation',
  [
    test(
      'mantiene todos los requisitos pendientes cuando la clave está vacía',
      () => {
        assert.deepEqual(
          getUsuarioPasswordRequirementStatus(''),
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
      'acepta una clave que cumple toda la política',
      () => {
        assert.deepEqual(
          getUsuarioPasswordRequirementStatus('Clave123!'),
          {
            minLength: true,
            maxLength: true,
            hasLetter: true,
            hasNumber: true,
            hasSpecialCharacter: true,
          }
        );
        assert.equal(
          areUsuarioPasswordRequirementsMet('Clave123!'),
          true
        );
      }
    ),

    test(
      'rechaza claves demasiado cortas o demasiado largas',
      () => {
        assert.equal(
          areUsuarioPasswordRequirementsMet('Ab1!'),
          false
        );
        assert.equal(
          areUsuarioPasswordRequirementsMet(
            `Ab1!${'x'.repeat(17)}`
          ),
          false
        );
      }
    ),

    test(
      'no considera los espacios como caracteres especiales',
      () => {
        const status =
          getUsuarioPasswordRequirementStatus('Clave 123');

        assert.equal(
          status.hasSpecialCharacter,
          false
        );
      }
    ),

    test(
      'reconoce letras con tildes y eñe',
      () => {
        const status =
          getUsuarioPasswordRequirementStatus('Ñúmero123!');

        assert.equal(status.hasLetter, true);
        assert.equal(
          areUsuarioPasswordRequirementsMet('Ñúmero123!'),
          true
        );
      }
    ),
  ]
);
