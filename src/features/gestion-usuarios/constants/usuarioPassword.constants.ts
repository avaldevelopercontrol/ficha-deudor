export const USUARIO_PASSWORD_MIN_LENGTH = 8;
export const USUARIO_PASSWORD_MAX_LENGTH = 20;

export const USUARIO_PASSWORD_REQUIREMENTS = [
  {
    id: 'minLength',
    label: `Mínimo ${USUARIO_PASSWORD_MIN_LENGTH} caracteres de largo.`,
  },
  {
    id: 'maxLength',
    label: `Máximo ${USUARIO_PASSWORD_MAX_LENGTH} caracteres de largo.`,
  },
  {
    id: 'hasLetter',
    label: 'Mínimo 1 carácter alfabético.',
  },
  {
    id: 'hasNumber',
    label: 'Mínimo 1 carácter numérico.',
  },
  {
    id: 'hasSpecialCharacter',
    label: 'Mínimo 1 carácter especial.',
  },
] as const;

export type UsuarioPasswordRequirementId =
  (typeof USUARIO_PASSWORD_REQUIREMENTS)[number]['id'];
