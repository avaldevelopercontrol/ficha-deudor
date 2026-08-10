import type {
  RegistrarPerfilFormData,
} from '../modules/mantener-perfil/types/registrarPerfil.types';

import type {
  UpdatePerfilRequestApi,
} from '../types/actualizarPerfil.types';

import type {
  PerfilApi,
} from '../types/perfil.types';

/**
 * Convierte la respuesta completa del GET
 * al modelo utilizado por el formulario.
 */
export const mapPerfilApiToForm = (
  perfil: PerfilApi
): RegistrarPerfilFormData => ({
  nombrePerfil:
    perfil.per_Nombre?.trim() ?? '',

  abreviatura:
    perfil.per_abreviatura?.trim() ?? '',

  estado:
    perfil.nEstadoGest === 1
      ? 1
      : 0,
});

/**
 * Conserva todos los valores originales
 * que no son editables desde el formulario.
 *
 * Solamente reemplaza:
 * - Nombre
 * - Abreviatura
 * - Estado
 */
export const buildUpdatePerfilRequest = (
  perfil: PerfilApi,
  form: RegistrarPerfilFormData
): UpdatePerfilRequestApi => {
  const fechaRegistro =
    perfil.per_Fecha?.trim();

  if (!fechaRegistro) {
    throw new Error(
      'No se pudo identificar la fecha de registro del perfil.'
    );
  }

  return {
    nid_perfil:
      perfil.nid_perfil,

    per_Fecha:
      fechaRegistro,

    per_Nombre:
      form.nombrePerfil.trim(),

    nper_EliminaRegJud:
      perfil.nper_EliminaRegJud,

    nper_AvisoVencidoJud:
      perfil.nper_AvisoVencidoJud,

    nper_RegistraRegJud:
      perfil.nper_RegistraRegJud,

    nper_MantUsuario:
      perfil.nper_MantUsuario,

    per_abreviatura:
      form.abreviatura.trim(),

    nEquiv_rrhh:
      perfil.nEquiv_rrhh,

    nEstadoGest:
      form.estado,

    bProduccionOnline:
      perfil.bProduccionOnline,

    nId_TipoGestion:
      perfil.nId_TipoGestion,

    bvisualiza_deudorhistoria:
      perfil.bvisualiza_deudorhistoria,
  };
};