import {
  USUARIO_PASSWORD_MAX_LENGTH,
  USUARIO_PASSWORD_MIN_LENGTH,
  type UsuarioPasswordRequirementId,
} from '../constants/usuarioPassword.constants';

const LETTER_PATTERN = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/;
const NUMBER_PATTERN = /\d/;
const SPECIAL_CHARACTER_PATTERN =
  /[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9\s]/;

export type UsuarioPasswordRequirementStatus = Record<
  UsuarioPasswordRequirementId,
  boolean
>;

export const getUsuarioPasswordRequirementStatus = (
  password: string
): UsuarioPasswordRequirementStatus => {
  const hasValue = password.length > 0;

  return {
    minLength:
      password.length >= USUARIO_PASSWORD_MIN_LENGTH,
    maxLength:
      hasValue &&
      password.length <= USUARIO_PASSWORD_MAX_LENGTH,
    hasLetter: LETTER_PATTERN.test(password),
    hasNumber: NUMBER_PATTERN.test(password),
    hasSpecialCharacter:
      SPECIAL_CHARACTER_PATTERN.test(password),
  };
};

export const areUsuarioPasswordRequirementsMet = (
  password: string
): boolean => {
  const requirementStatus =
    getUsuarioPasswordRequirementStatus(password);

  return Object.values(requirementStatus).every(Boolean);
};
