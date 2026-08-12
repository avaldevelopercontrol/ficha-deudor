import type {
  SelectOption,
} from '@shared/types';

import type {
  CampanaDiscadorApi,
  CampanaDiscadorOption,
  GrupoApi,
  PerfilApi,
  SubZonaGeneralApi,
} from '../types/usuarioCatalogos.types';

const cleanLabel = (
  value: string
): string =>
  value.trim();

const isPerfilActivo = (
  value: number
): boolean => {
  if (value !== 0 && value !== 1) {
    throw new Error(
      'El estado del perfil debe ser 0 o 1.'
    );
  }

  return value === 1;
};

export const mapPerfilesToOptions = (
  data: PerfilApi[]
): SelectOption<string>[] =>
  data
    .filter((item) =>
      isPerfilActivo(
        item.nEstadoGest
      )
    )
    .map((item) => ({
      id: String(
        item.nid_perfil
      ),
      label: cleanLabel(
        item.per_Nombre
      ),
    }));

export const mapGruposToOptions = (
  data: GrupoApi[]
): SelectOption<string>[] =>
  data.map((item) => ({
    id: String(
      item.nId_Grupo
    ),

    label: cleanLabel(
      item.cNombre_Grupo
    ),
  }));

export const mapSubZonasToOptions = (
  data: SubZonaGeneralApi[]
): SelectOption<string>[] =>
  data.map((item) => ({
    id: String(
      item.nId_SubZonaGen
    ),

    label: cleanLabel(
      item.cSzgn_Nombre
    ),
  }));

export const mapCampanasDiscadorToOptions = (
  data: CampanaDiscadorApi[]
): CampanaDiscadorOption[] => {
  const optionsByCode =
    new Map<
      number,
      CampanaDiscadorOption
    >();

  data.forEach((item) => {
    const codigo =
      item.nroCampanaDiscador;

    /*
     * El POST recibe únicamente el código.
     * Por eso dos registros con el mismo código
     * representan la misma opción para creación.
     */
    if (
      optionsByCode.has(
        codigo
      )
    ) {
      return;
    }

    optionsByCode.set(
      codigo,
      {
        id: String(codigo),
        codigo,
        label: cleanLabel(
          item.cNombreCampana
        ),
      }
    );
  });

  return Array.from(
    optionsByCode.values()
  ).sort((first, second) =>
    first.label.localeCompare(
      second.label,
      'es',
      {
        sensitivity: 'base',
      }
    )
  );
};