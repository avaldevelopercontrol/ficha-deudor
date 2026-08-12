import type {
  RegistrarUsuarioFormData,
} from '../modules/mantener-usuario/types/registrarUsuario.types';

import type {
  CreateUsuarioRequestApi,
} from '../types/crearUsuario.types';

const parseNumericId = (
  value: string
): number => {
  if (!value) {
    return 0;
  }

  const parsedValue = Number(value);

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue < 0
  ) {
    throw new Error(
      `El identificador "${value}" no es válido para registrar el usuario.`
    );
  }

  return parsedValue;
};

const mapFechaNacimiento = (
  value: string
): string => {
  if (!value) {
    return '';
  }

  /*
   * El input date entrega YYYY-MM-DD. Se conserva
   * exactamente el día elegido y se serializa en el
   * formato ISO esperado por el contrato del backend.
   */
  return `${value}T00:00:00.000Z`;
};

export const buildCreateUsuarioRequest = (
  form: RegistrarUsuarioFormData
): CreateUsuarioRequestApi => ({
  cUsr_NroDoc: form.dni.trim(),

  cUsr_ApePat:
    form.apellidoPaterno.trim(),

  cUsr_ApeMat:
    form.apellidoMaterno.trim(),

  cUsr_Nombres:
    form.nombre.trim(),

  cUsr_Login:
    form.usuario.trim(),

  /*
   * La contraseña se envía exactamente como fue
   * ingresada. No se aplica trim ni transformación.
   */
  cUsr_Pass:
    form.contrasena,

  nid_perfil:
    parseNumericId(form.perfil),

  nId_Grupo:
    parseNumericId(form.grupo),

  /*
   * El código de recaudador no aplica en este flujo.
   * El contrato del backend mantiene la propiedad,
   * por lo que se envía siempre como cadena vacía.
   */
  cod_Recau: '',

  bEstado:
    form.estado,

  dUsr_FecNac:
    mapFechaNacimiento(
      form.fechaNacimiento
    ),

  bSexo:
    form.sexo === ''
      ? 0
      : Number(form.sexo),

  nId_Ubigeo:
    parseNumericId(
      form.departamentoLabor
    ),

  nUsr_CiuGestor:
    form.ciudadGestor.trim(),

  nId_SubZonaGen:
    parseNumericId(
      form.subZonalOficina
    ),

  cUsr_Celular:
    form.movilEmpresa.trim(),

  cUsr_Anexo:
    form.anexo.trim(),

  cUsr_Email:
    form.emailEmpresa
      .trim()
      .toLowerCase(),

  cUsr_EmailPersonal:
    form.emailPersonal
      .trim()
      .toLowerCase(),

  nroCampanaDiscador:
    parseNumericId(
      form.campanaDiscador
    ),
});
