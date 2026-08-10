import {
  getCurrentPeruDateTime,
} from '@shared/utils/peruDateTime.utils';

import type {
  RegistrarPerfilFormData,
} from '../modules/mantener-perfil/types/registrarPerfil.types';

import type {
  CreatePerfilRequestApi,
} from '../types/crearPerfil.types';

export const buildCreatePerfilRequest = (
  form: RegistrarPerfilFormData,
  currentDate = new Date()
): CreatePerfilRequestApi => ({
  nid_perfil: 0,

  /*
   * La fecha se genera al momento
   * exacto de realizar el registro.
   */
  per_Fecha:
    getCurrentPeruDateTime(
      currentDate
    ),

  per_Nombre:
    form.nombrePerfil.trim(),

  nper_EliminaRegJud: 0,
  nper_AvisoVencidoJud: 0,
  nper_RegistraRegJud: 0,
  nper_MantUsuario: 0,

  per_abreviatura:
    form.abreviatura.trim(),

  nEquiv_rrhh: 0,

  nEstadoGest:
    form.estado,

  bProduccionOnline: true,

  nId_TipoGestion: 0,

  bvisualiza_deudorhistoria: true,
});