import type {
  Grupo,
  GrupoApi,
  GrupoEstado,
} from '../types/grupo.types';

const toNumberValue = (
  value: unknown
): number => {
  const numericValue = Number(value);

  return Number.isFinite(
    numericValue
  )
    ? numericValue
    : 0;
};

const toTrimmedString = (
  value: unknown
): string =>
  typeof value === 'string'
    ? value.trim()
    : '';

const mapEstado = (
  value: unknown
): GrupoEstado =>
  value === true ||
  value === 1 ||
  value === '1'
    ? 'Activo'
    : 'Inactivo';

export const mapGrupo = (
  grupo: GrupoApi
): Grupo => ({
  idGrupo: toNumberValue(
    grupo.nId_Grupo
  ),

  nombreGrupo: toTrimmedString(
    grupo.cNombre_Grupo
  ),

  cliente: toTrimmedString(
    grupo.cCli_Nombre
  ),

  estado: mapEstado(
    grupo.bEstado
  ),
});

export const mapGruposResponse = (
  response:
    | GrupoApi[]
    | GrupoApi
    | null
): Grupo[] => {
  const grupos = Array.isArray(
    response
  )
    ? response
    : response
      ? [response]
      : [];

  return grupos.map(mapGrupo);
};
