import type {
  RegistrarUsuarioFormData,
} from '../modules/mantener-usuario/types/registrarUsuario.types';

import type {
  CreateUsuarioRequestApi,
} from '../types/crearUsuario.types';

/*
 * Swagger define cod_Recau como string,
 * mientras que el formulario lo representa
 * mediante un checkbox.
 *
 * Si el backend espera otros valores, solamente
 * se modifican estas dos constantes.
 */
const CODIGO_RECAUDADOR_CHECKED =
  '1';

const CODIGO_RECAUDADOR_UNCHECKED =
  '0';

const parseNumericId = (
  value: string
): number => {
  const parsedValue =
    Number(value);

  if (
    !Number.isInteger(
      parsedValue
    ) ||
    parsedValue < 0
  ) {
    return 0;
  }

  return parsedValue;
};

const parseAuthenticatedUserId = (
  value: string
): number => {
  const parsedValue =
    Number(value);

  if (
    !Number.isInteger(
      parsedValue
    ) ||
    parsedValue <= 0
  ) {
    throw new Error(
      'No se pudo identificar al usuario autenticado que registra la operación.'
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
   * El input date entrega YYYY-MM-DD.
   * Se conserva exactamente el día seleccionado
   * sin depender de la zona horaria del navegador.
   */
  return `${value}T00:00:00.000Z`;
};

export const buildCreateUsuarioRequest = (
  form: RegistrarUsuarioFormData,
  authenticatedUserId: string
): CreateUsuarioRequestApi => ({
  /*
   * Usuario autenticado que ejecuta el registro.
   * Nunca debe enviarse 0 porque el backend lo usa
   * para identificar al responsable de la operación.
   */
  nId_Usuario:
    parseAuthenticatedUserId(
      authenticatedUserId
    ),

  cUsr_NroDoc:
    form.dni.trim(),

  cUsr_ApePat:
    form.apellidoPaterno.trim(),

  cUsr_ApeMat:
    form.apellidoMaterno.trim(),

  cUsr_Nombres:
    form.nombre.trim(),

  cUsr_Login:
    form.usuario.trim(),

  /*
   * No se aplica trim a la contraseña.
   * Los espacios podrían formar parte
   * de la clave ingresada.
   */
  cUsr_Pass:
    form.contrasena,

  nid_perfil:
    parseNumericId(
      form.perfil
    ),

  nId_Grupo:
    parseNumericId(
      form.grupo
    ),

  cod_Recau:
    form.codigoRecaudador
      ? CODIGO_RECAUDADOR_CHECKED
      : CODIGO_RECAUDADOR_UNCHECKED,

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

  /*
   * El valor 0 representa SIN ZONA
   * y es válido para el formulario.
   */
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