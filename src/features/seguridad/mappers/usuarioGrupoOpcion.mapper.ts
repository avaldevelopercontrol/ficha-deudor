
import {
  toRequiredId,
} from '@shared/utils/number.utils';

import type {
  UsuarioGrupoOpcionDetalle,
  UsuarioGrupoOpcionDetalleApi,
  UsuarioGrupoOpcionListado,
  UsuarioGrupoOpcionListadoApi,
  UsuarioGrupoOpcionPermiso,
} from '../types/usuarioGrupoOpcion.types';

const toRequiredText = (
  value: unknown,
  fieldName: string
): string => {
  if (typeof value !== 'string') {
    throw new Error(
      `El campo ${fieldName} debe contener un texto válido.`
    );
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    throw new Error(
      `El campo ${fieldName} debe contener un texto válido.`
    );
  }

  return normalizedValue;
};

const toOptionalText = (
  value: unknown
): string =>
  typeof value === 'string'
    ? value.trim()
    : '';

const buildNombreCompleto = (
  item: UsuarioGrupoOpcionListadoApi
): string => {
  const nombreCompleto = [
    toOptionalText(item.cUsr_Nombres),
    toOptionalText(item.cUsr_ApePat),
    toOptionalText(item.cUsr_ApeMat),
  ]
    .filter(Boolean)
    .join(' ');

  if (!nombreCompleto) {
    throw new Error(
      'Los campos de nombre del usuario no contienen información válida.'
    );
  }

  return nombreCompleto;
};

const toBoolean = (
  value: unknown,
  fieldName: string
): boolean => {
  if (
    value === null ||
    value === undefined
  ) {
    return false;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  throw new Error(
    `El campo ${fieldName} debe contener un valor booleano válido.`
  );
};

const toRequiredBoolean = (
  value: unknown,
  fieldName: string
): boolean => {
  if (typeof value !== 'boolean') {
    throw new Error(
      `El campo ${fieldName} debe contener un valor booleano válido.`
    );
  }

  return value;
};

const toRequiredDateText = (
  value: unknown,
  fieldName: string
): string =>
  toRequiredText(
    value,
    fieldName
  );

export const mapUsuarioGrupoOpcionListado = (
  item: UsuarioGrupoOpcionListadoApi
): UsuarioGrupoOpcionListado => ({
  idUsuarioGrupoOpcion: toRequiredId(
    item.nId_UsuarioGrupoOpcion,
    'nId_UsuarioGrupoOpcion'
  ),

  idUsuario: toRequiredId(
    item.nId_Usuario,
    'nId_Usuario'
  ),

  usuario: toRequiredText(
    item.cUsr_Login,
    'cUsr_Login'
  ),

  nombreCompleto:
    buildNombreCompleto(item),

  idGrupo: toRequiredId(
    item.nId_Grupo,
    'nId_Grupo'
  ),

  grupo: toRequiredText(
    item.cNombre_Grupo,
    'cNombre_Grupo'
  ),

  idOpcion: toRequiredId(
    item.nId_Opcion,
    'nId_Opcion'
  ),

  codigoOpcion: toRequiredText(
    item.sCodigoOpcion,
    'sCodigoOpcion'
  ),

  opcion: toRequiredText(
    item.sNombreOpcion,
    'sNombreOpcion'
  ),

  consultar: toBoolean(
    item.bConsultar,
    'bConsultar'
  ),

  insertar: toBoolean(
    item.bInsertar,
    'bInsertar'
  ),

  editar: toBoolean(
    item.bEditar,
    'bEditar'
  ),

  eliminar: toBoolean(
    item.bEliminar,
    'bEliminar'
  ),

  exportar: toBoolean(
    item.bExportar,
    'bExportar'
  ),

  estado: toRequiredBoolean(
    item.bEstado,
    'bEstado'
  )
    ? 'Activo'
    : 'Inactivo',
});

export const mapUsuarioGrupoOpcionPermiso = (
  item: UsuarioGrupoOpcionListadoApi
): UsuarioGrupoOpcionPermiso => ({
  idUsuarioGrupoOpcion: toRequiredId(
    item.nId_UsuarioGrupoOpcion,
    'nId_UsuarioGrupoOpcion'
  ),
  idUsuario: toRequiredId(
    item.nId_Usuario,
    'nId_Usuario'
  ),
  idGrupo: toRequiredId(
    item.nId_Grupo,
    'nId_Grupo'
  ),
  idOpcion: toRequiredId(
    item.nId_Opcion,
    'nId_Opcion'
  ),
  consultar: toBoolean(
    item.bConsultar,
    'bConsultar'
  ),
  insertar: toBoolean(
    item.bInsertar,
    'bInsertar'
  ),
  editar: toBoolean(
    item.bEditar,
    'bEditar'
  ),
  eliminar: toBoolean(
    item.bEliminar,
    'bEliminar'
  ),
  exportar: toBoolean(
    item.bExportar,
    'bExportar'
  ),
  estadoActivo: toRequiredBoolean(
    item.bEstado,
    'bEstado'
  ),
});

export const mapUsuarioGrupoOpcionDetalle = (
  item:
    | UsuarioGrupoOpcionDetalleApi
    | UsuarioGrupoOpcionListadoApi
): UsuarioGrupoOpcionDetalle => ({
  idUsuarioGrupoOpcion: toRequiredId(
    item.nId_UsuarioGrupoOpcion,
    'nId_UsuarioGrupoOpcion'
  ),
  idUsuario: toRequiredId(
    item.nId_Usuario,
    'nId_Usuario'
  ),
  idGrupo: toRequiredId(
    item.nId_Grupo,
    'nId_Grupo'
  ),
  idOpcion: toRequiredId(
    item.nId_Opcion,
    'nId_Opcion'
  ),
  consultar: toBoolean(
    item.bConsultar,
    'bConsultar'
  ),
  insertar: toBoolean(
    item.bInsertar,
    'bInsertar'
  ),
  editar: toBoolean(
    item.bEditar,
    'bEditar'
  ),
  eliminar: toBoolean(
    item.bEliminar,
    'bEliminar'
  ),
  exportar: toBoolean(
    item.bExportar,
    'bExportar'
  ),
  estadoActivo: toRequiredBoolean(
    item.bEstado,
    'bEstado'
  ),
  crea: toRequiredId(
    item.nCrea,
    'nCrea'
  ),
  fechaCrea: toRequiredDateText(
    item.dFechaCrea,
    'dFechaCrea'
  ),
});

export const mapUsuarioGrupoOpcionesListadoResponse = (
  response:
    | UsuarioGrupoOpcionListadoApi[]
    | UsuarioGrupoOpcionListadoApi
    | null
): UsuarioGrupoOpcionListado[] => {
  const items = Array.isArray(response)
    ? response
    : response
      ? [response]
      : [];

  return items.map(
    mapUsuarioGrupoOpcionListado
  );
};

export const mapUsuarioGrupoOpcionesDetalleResponse = (
  response:
    | UsuarioGrupoOpcionListadoApi[]
    | UsuarioGrupoOpcionListadoApi
    | null
): UsuarioGrupoOpcionDetalle[] => {
  const items = Array.isArray(response)
    ? response
    : response
      ? [response]
      : [];

  return items.map(
    mapUsuarioGrupoOpcionDetalle
  );
};
