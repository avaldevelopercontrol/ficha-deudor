import type {
  EditarUsuarioFormData,
  EditarUsuarioOriginalValues,
  UsuarioGrupoItem,
} from '../modules/mantener-usuario/types/editarUsuario.types';

import type {
  UpdateUsuarioRequestApi,
  UsuarioDetalleApi,
  UsuarioGrupoApi,
  UsuarioGrupoFaltanteApi,
} from '../types/editarUsuario.types';

const parseNumericId = (
  value: string,
  fieldLabel: string
): number => {
  if (!value) {
    return 0;
  }

  const parsed = Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed < 0
  ) {
    throw new Error(
      `${fieldLabel} no es válido.`
    );
  }

  return parsed;
};

const toDateInputValue = (
  value: string | null
): string => {
  if (!value) {
    return '';
  }

  const match =
    /^(\d{4}-\d{2}-\d{2})/.exec(
      value
    );

  return match?.[1] ?? '';
};

const toApiDate = (
  value: string
): string =>
  value
    ? `${value}T00:00:00.000Z`
    : '';

const toSexoValue = (
  value: number
): 1 | 2 | '' =>
  value === 1 || value === 2
    ? value
    : '';

export const mapUsuarioDetalleToEditarForm = (
  usuario: UsuarioDetalleApi
): EditarUsuarioFormData => ({
  dni:
    usuario.cUsr_NroDoc?.trim() ?? '',
  nombre:
    usuario.cUsr_Nombres?.trim() ?? '',
  apellidoPaterno:
    usuario.cUsr_ApePat?.trim() ?? '',
  apellidoMaterno:
    usuario.cUsr_ApeMat?.trim() ?? '',
  usuario:
    usuario.cUsr_Login?.trim() ?? '',
  contrasenaActual: '',
  cambiarContrasena: false,
  contrasenaNueva: '',
  perfil:
    String(usuario.nid_perfil ?? ''),
  estado: Boolean(usuario.bEstado),
  fechaNacimiento:
    toDateInputValue(
      usuario.dUsr_FecNac
    ),
  sexo:
    toSexoValue(usuario.bSexo),
  departamentoLabor:
    String(usuario.nId_Ubigeo ?? ''),
  ciudadGestor:
    usuario.nUsr_CiuGestor?.trim() ?? '',
  subZonalOficina:
    usuario.nId_SubZonaGen > 0
      ? String(usuario.nId_SubZonaGen)
      : '',
  movilEmpresa:
    usuario.cUsr_Celular?.trim() ?? '',
  anexo:
    usuario.cUsr_Anexo?.trim() ?? '',
  emailEmpresa:
    usuario.cUsr_Email?.trim() ?? '',
  emailPersonal:
    usuario.cUsr_EmailPersonal?.trim() ?? '',
  campanaDiscador:
    usuario.nroCampanaDiscador > 0
      ? String(
          usuario.nroCampanaDiscador
        )
      : '',
});

export const getEditarUsuarioOriginalValues = (
  usuario: UsuarioDetalleApi
): EditarUsuarioOriginalValues => ({
  idUsuario: usuario.nId_Usuario,
  dni:
    usuario.cUsr_NroDoc?.trim() ?? '',
  usuario:
    usuario.cUsr_Login?.trim() ?? '',
  passwordPersistida:
    usuario.cUsr_Pass ?? '',
  anexo:
    usuario.cUsr_Anexo?.trim() ?? '',
  grupoPrincipalId:
    usuario.nId_Grupo,
  codigoRecaudador:
    usuario.cod_Recau?.trim() ?? '',
});

export const buildUpdateUsuarioRequest = (
  form: EditarUsuarioFormData,
  original: EditarUsuarioOriginalValues
): UpdateUsuarioRequestApi => ({
  nId_Usuario:
    original.idUsuario,
  cUsr_NroDoc:
    original.dni,
  cUsr_NroDocNew:
    form.dni.trim(),
  cUsr_ApePat:
    form.apellidoPaterno.trim(),
  cUsr_ApeMat:
    form.apellidoMaterno.trim(),
  cUsr_Nombres:
    form.nombre.trim(),
  cUsr_Login:
    original.usuario,
  cUsr_LoginNew:
    form.usuario.trim(),
  bCambioPass:
    form.cambiarContrasena,
  /*
   * Contrato actual del backend:
   * - si bCambioPass=true, se envían la clave actual ingresada
   *   por el operador y la nueva clave;
   * - si bCambioPass=false, se conserva exactamente cUsr_Pass
   *   obtenido del GET en ambos campos, sin exponerlo en la UI.
   */
  cUsr_Pass:
    form.cambiarContrasena
      ? form.contrasenaActual
      : original.passwordPersistida,
  cUsr_PassNew:
    form.cambiarContrasena
      ? form.contrasenaNueva
      : original.passwordPersistida,
  nid_perfil:
    parseNumericId(
      form.perfil,
      'El perfil'
    ),
  nId_Grupo:
    original.grupoPrincipalId,
  cod_Recau:
    original.codigoRecaudador,
  bEstado:
    form.estado,
  dUsr_FecNac:
    toApiDate(
      form.fechaNacimiento
    ),
  bSexo:
    form.sexo === ''
      ? 0
      : Number(form.sexo),
  nId_Ubigeo:
    parseNumericId(
      form.departamentoLabor,
      'El departamento de labor'
    ),
  nUsr_CiuGestor:
    form.ciudadGestor.trim(),
  nId_SubZonaGen:
    parseNumericId(
      form.subZonalOficina,
      'La sub zonal - oficina'
    ),
  cUsr_Celular:
    form.movilEmpresa.trim(),
  cUsr_Anexo:
    original.anexo,
  cUsr_AnexoNew:
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
      form.campanaDiscador,
      'La campaña de discador'
    ),
});

const normalizeComparableText = (
  value: string | null | undefined
): string =>
  (value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('es');

const toComparableDate = (
  value: string | null | undefined
): string =>
  /^\d{4}-\d{2}-\d{2}/.exec(
    value ?? ''
  )?.[0] ?? '';

const toComparableNumber = (
  value: string
): number => {
  if (!value) {
    return 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
};

/**
 * Comprueba únicamente campos que el GET de detalle permite
 * verificar después del PUT. La contraseña no se compara por
 * seguridad y porque el backend puede almacenarla transformada.
 */
export const getUsuarioUpdateMismatches = (
  form: EditarUsuarioFormData,
  persisted: UsuarioDetalleApi
): string[] => {
  const mismatches: string[] = [];

  const checkText = (
    label: string,
    expected: string,
    actual: string | null | undefined
  ) => {
    if (
      normalizeComparableText(expected) !==
      normalizeComparableText(actual)
    ) {
      mismatches.push(label);
    }
  };

  const checkNumber = (
    label: string,
    expected: number,
    actual: number
  ) => {
    if (expected !== actual) {
      mismatches.push(label);
    }
  };

  checkText(
    'DNI',
    form.dni,
    persisted.cUsr_NroDoc
  );
  checkText(
    'nombre',
    form.nombre,
    persisted.cUsr_Nombres
  );
  checkText(
    'apellido paterno',
    form.apellidoPaterno,
    persisted.cUsr_ApePat
  );
  checkText(
    'apellido materno',
    form.apellidoMaterno,
    persisted.cUsr_ApeMat
  );
  checkText(
    'usuario',
    form.usuario,
    persisted.cUsr_Login
  );

  checkNumber(
    'perfil',
    toComparableNumber(form.perfil),
    persisted.nid_perfil
  );

  if (
    Boolean(form.estado) !==
    Boolean(persisted.bEstado)
  ) {
    mismatches.push('estado');
  }

  if (
    form.fechaNacimiento !==
    toComparableDate(
      persisted.dUsr_FecNac
    )
  ) {
    mismatches.push(
      'fecha de nacimiento'
    );
  }

  checkNumber(
    'sexo',
    form.sexo === ''
      ? 0
      : Number(form.sexo),
    persisted.bSexo
  );
  checkNumber(
    'departamento de labor',
    toComparableNumber(
      form.departamentoLabor
    ),
    persisted.nId_Ubigeo
  );
  checkText(
    'ciudad gestor',
    form.ciudadGestor,
    persisted.nUsr_CiuGestor
  );
  checkNumber(
    'sub zonal - oficina',
    toComparableNumber(
      form.subZonalOficina
    ),
    persisted.nId_SubZonaGen
  );
  checkText(
    'móvil empresa',
    form.movilEmpresa,
    persisted.cUsr_Celular
  );
  checkText(
    'anexo',
    form.anexo,
    persisted.cUsr_Anexo
  );
  checkText(
    'email empresa',
    form.emailEmpresa,
    persisted.cUsr_Email
  );
  checkText(
    'email personal',
    form.emailPersonal,
    persisted.cUsr_EmailPersonal
  );
  checkNumber(
    'campaña de discador',
    toComparableNumber(
      form.campanaDiscador
    ),
    persisted.nroCampanaDiscador
  );

  return mismatches;
};

export const mapUsuarioGrupoAsignado = (
  item: UsuarioGrupoApi
): UsuarioGrupoItem => ({
  idUsuarioGrupo:
    item.nId_UGrupo,
  idUsuario:
    item.nId_Usuario,
  idGrupo:
    item.nid_grupo,
  nombre:
    item.cNombre_Grupo.trim(),
});

export const mapUsuarioGrupoFaltante = (
  item: UsuarioGrupoFaltanteApi
): UsuarioGrupoItem => ({
  idUsuarioGrupo: null,
  idUsuario:
    item.nId_Usuario,
  idGrupo:
    item.nid_grupo,
  nombre:
    item.cNombre_Grupo.trim(),
});

export interface UsuarioGrupoDiff {
  agregar: UsuarioGrupoItem[];
  quitar: UsuarioGrupoItem[];
}

export const getUsuarioGrupoDiff = (
  iniciales: readonly UsuarioGrupoItem[],
  actuales: readonly UsuarioGrupoItem[]
): UsuarioGrupoDiff => {
  const initialIds = new Set(
    iniciales.map(
      (item) => item.idGrupo
    )
  );

  const currentIds = new Set(
    actuales.map(
      (item) => item.idGrupo
    )
  );

  return {
    agregar: actuales.filter(
      (item) =>
        !initialIds.has(
          item.idGrupo
        )
    ),
    quitar: iniciales.filter(
      (item) =>
        !currentIds.has(
          item.idGrupo
        )
    ),
  };
};
