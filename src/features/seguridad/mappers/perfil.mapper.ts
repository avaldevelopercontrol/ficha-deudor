import type {
  Perfil,
  PerfilApi,
  PerfilEstado,
  PerfilIndicador,
} from '../types/perfil.types';

const toNumberValue = (
  value: unknown
): number => {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : 0;
};

const toTrimmedString = (
  value: unknown
): string => {
  if (
    value === null ||
    value === undefined
  ) {
    return '';
  }

  return String(value).trim();
};

/**
 * Formatea directamente YYYY-MM-DD
 * sin utilizar new Date(), evitando
 * cambios de día por zona horaria.
 */
const formatDateOnly = (
  value: unknown
): string => {
  const dateValue =
    toTrimmedString(value);

  if (!dateValue) {
    return '';
  }

  const match = dateValue.match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (!match) {
    return dateValue;
  }

  const [, year, month, day] =
    match;

  return `${day}/${month}/${year}`;
};

const mapEstado = (
  value: unknown
): PerfilEstado =>
  Number(value) === 1
    ? 'Activo'
    : 'Inactivo';

const mapIndicador = (
  value: unknown
): PerfilIndicador =>
  value === true
    ? 'Sí'
    : 'No';

export const mapPerfil = (
  perfil: PerfilApi
): Perfil => ({
  idPerfil: toNumberValue(
    perfil.nid_perfil
  ),

  nombrePerfil: toTrimmedString(
    perfil.per_Nombre
  ),

  abreviatura: toTrimmedString(
    perfil.per_abreviatura
  ),

  fechaRegistro: formatDateOnly(
    perfil.per_Fecha
  ),

  estado: mapEstado(
    perfil.nEstadoGest
  ),

  produccionOnline: mapIndicador(
    perfil.bProduccionOnline
  ),

  historiaDeudor: mapIndicador(
    perfil.bvisualiza_deudorhistoria
  ),
});

export const mapPerfilesResponse = (
  response:
    | PerfilApi[]
    | PerfilApi
    | null
): Perfil[] => {
  const perfiles = Array.isArray(
    response
  )
    ? response
    : response
      ? [response]
      : [];

  return perfiles.map(mapPerfil);
};