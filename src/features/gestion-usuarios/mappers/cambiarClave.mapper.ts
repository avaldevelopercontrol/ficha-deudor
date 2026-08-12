import { toRequiredId } from '@shared/utils/number.utils';

import type {
  CambiarClaveFormData,
  ResetearClaveUsuarioRequest,
} from '../types/cambiarClave.types';

export const buildResetearClaveUsuarioRequest = (
  form: CambiarClaveFormData,
  authenticatedUserId: string,
  fechaRegistro = new Date()
): ResetearClaveUsuarioRequest => ({
  nId_Usuario: toRequiredId(
    authenticatedUserId,
    'nId_Usuario'
  ),
  cUsr_PassActual: form.claveActual,
  cUsr_PassNueva: form.claveNueva,
  cUsr_PassConfirma: form.confirmarClaveNueva,
  dFecRegistro: fechaRegistro.toISOString(),
});
