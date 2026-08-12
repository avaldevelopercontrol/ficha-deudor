import {
  toRequiredId,
} from '@shared/utils/number.utils';

import type {
  PerfilOpcionCount,
  PerfilOpcionCountApi,
  PerfilAccesoOptionApi,
  PerfilOpcionApi,
  PerfilOpcionDetalle,
} from '../types/perfilOpcion.types';

import type {
  PerfilAccesoOption,
} from '../modules/mantener-accesos-perfil/types/asignarAccesosPerfil.types';

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

const toNonNegativeInteger = (
  value: unknown,
  fieldName: string
): number => {
  const normalizedValue =
    typeof value === 'string'
      ? value.trim()
      : value;

  const parsedValue =
    typeof normalizedValue === 'number'
      ? normalizedValue
      : typeof normalizedValue === 'string' &&
          /^\d+$/.test(normalizedValue)
        ? Number(normalizedValue)
        : Number.NaN;

  if (
    !Number.isSafeInteger(parsedValue) ||
    parsedValue < 0
  ) {
    throw new Error(
      `El campo ${fieldName} debe contener un entero igual o mayor que cero.`
    );
  }

  return parsedValue;
};

const toBooleanValue = (
  value: unknown
): boolean =>
  value === true ||
  value === 1 ||
  value === '1' ||
  value === 'true';

const toPerfilEstadoActivo = (
  value: unknown
): boolean => {
  const estado = toNonNegativeInteger(
    value,
    'nEstadoGest'
  );

  if (estado !== 0 && estado !== 1) {
    throw new Error(
      'El campo nEstadoGest debe ser 0 o 1.'
    );
  }

  return estado === 1;
};

export const mapPerfilOpcionCount = (
  item: PerfilOpcionCountApi
): PerfilOpcionCount => ({
  idPerfil: toRequiredId(
    item.nId_Perfil,
    'nId_Perfil'
  ),

  nombrePerfil: toRequiredText(
    item.per_Nombre,
    'per_Nombre'
  ),

  cantidadOpciones: toNonNegativeInteger(
    item.nCantidadOpciones,
    'nCantidadOpciones'
  ),
});

export const mapPerfilOptionsCountResponse = (
  response:
    | PerfilOpcionCountApi[]
    | PerfilOpcionCountApi
    | null
): PerfilOpcionCount[] => {
  const items = Array.isArray(response)
    ? response
    : response
      ? [response]
      : [];

  return items.map(mapPerfilOpcionCount);
};

export const mapPerfilAccesoOption = (
  item: PerfilAccesoOptionApi
): PerfilAccesoOption => ({
  idPerfil: toRequiredId(
    item.nid_perfil,
    'nid_perfil'
  ),

  nombrePerfil: toRequiredText(
    item.per_Nombre,
    'per_Nombre'
  ),

  estadoActivo: toPerfilEstadoActivo(
    item.nEstadoGest
  ),
});

export const mapPerfilesAccesoResponse = (
  response:
    | PerfilAccesoOptionApi[]
    | PerfilAccesoOptionApi
    | null
): PerfilAccesoOption[] => {
  const items = Array.isArray(response)
    ? response
    : response
      ? [response]
      : [];

  return items.map(mapPerfilAccesoOption);
};

export const mapPerfilOpcionDetalle = (
  item: PerfilOpcionApi
): PerfilOpcionDetalle => ({
  idPerfilOpcion: toRequiredId(
    item.nId_PerfilOpcion,
    'nId_PerfilOpcion'
  ),

  idPerfil: toRequiredId(
    item.nId_Perfil,
    'nId_Perfil'
  ),

  idOpcion: toRequiredId(
    item.nId_Opcion,
    'nId_Opcion'
  ),

  consultar: toBooleanValue(
    item.bConsultar
  ),

  insertar: toBooleanValue(
    item.bInsertar
  ),

  editar: toBooleanValue(
    item.bEditar
  ),

  eliminar: toBooleanValue(
    item.bEliminar
  ),

  exportar: toBooleanValue(
    item.bExportar
  ),

  estadoActivo: toBooleanValue(
    item.bEstado
  ),
});

export const mapPerfilOpcionesPorPerfilResponse = (
  response:
    | PerfilOpcionApi[]
    | PerfilOpcionApi
    | null
): PerfilOpcionDetalle[] => {
  const items = Array.isArray(response)
    ? response
    : response
      ? [response]
      : [];

  return items.map(mapPerfilOpcionDetalle);
};
