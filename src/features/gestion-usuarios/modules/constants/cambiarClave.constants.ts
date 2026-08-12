import {
  USUARIO_PASSWORD_MAX_LENGTH,
  USUARIO_PASSWORD_MIN_LENGTH,
  USUARIO_PASSWORD_REQUIREMENTS,
  type UsuarioPasswordRequirementId,
} from '../../constants/usuarioPassword.constants';

import type {
  CambiarClaveFormData,
} from '../../types/cambiarClave.types';

export const CAMBIAR_CLAVE_PASSWORD_MIN_LENGTH =
  USUARIO_PASSWORD_MIN_LENGTH;

export const CAMBIAR_CLAVE_PASSWORD_MAX_LENGTH =
  USUARIO_PASSWORD_MAX_LENGTH;

export const CAMBIAR_CLAVE_INITIAL_FORM: CambiarClaveFormData = {
  claveActual: '',
  claveNueva: '',
  confirmarClaveNueva: '',
};

export const CAMBIAR_CLAVE_REQUIREMENTS =
  USUARIO_PASSWORD_REQUIREMENTS;

export type CambiarClaveRequirementId =
  UsuarioPasswordRequirementId;

export const CAMBIAR_CLAVE_HISTORY_NOTICE =
  'No puede repetir claves anteriores.';

export const CAMBIAR_CLAVE_TEXTS = {
  submitLabel: 'Confirmar',
  submittingLabel: 'Actualizando...',
  successTitle: 'Clave actualizada correctamente',
  errorTitle: 'No se pudo cambiar la clave',
  successFallback: 'Tu clave de acceso se cambió correctamente.',
  apiErrorFallback: 'No se pudo actualizar la clave. Intente nuevamente.',
  invalidSession:
    'No se pudo identificar al usuario autenticado. Vuelva a iniciar sesión e intente nuevamente.',
  editPermissionDenied:
    'No tiene permiso para cambiar la clave.',
} as const;
