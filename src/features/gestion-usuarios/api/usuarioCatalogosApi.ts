import {
  apiClient,
} from '@shared/api/apiClient';

import type {
  SelectOption,
} from '@shared/types';

import {
  GESTION_USUARIOS_API_ENDPOINTS,
} from '../constants/gestionUsuariosRoutes.constants';

import {
  mapCampanasDiscadorToOptions,
  mapGruposToOptions,
  mapPerfilesToOptions,
  mapSubZonasToOptions,
} from '../mappers/usuarioCatalogos.mapper';

import type {
  CampanaDiscadorOption,
  GetCampanasDiscadorResponse,
  GetGruposResponse,
  GetPerfilesResponse,
  GetSubZonasGeneralResponse,
} from '../types/usuarioCatalogos.types';

const assertSuccessfulCatalogResponse = (
  result: {
    statusCode: number;
    message?: string;
    messageUser?: string;
  },
  fallbackMessage: string
): void => {
  if (
    result.statusCode >= 200 &&
    result.statusCode < 300
  ) {
    return;
  }

  throw new Error(
    result.messageUser?.trim() ||
      result.message?.trim() ||
      fallbackMessage
  );
};

export const fetchPerfiles = async (
  signal?: AbortSignal
): Promise<SelectOption<string>[]> => {
  const result =
    await apiClient<
      GetPerfilesResponse
    >(
      GESTION_USUARIOS_API_ENDPOINTS
        .getPerfiles,
      {
        signal,
      }
    );

  assertSuccessfulCatalogResponse(
    result,
    'No se pudieron cargar los perfiles.'
  );

  return mapPerfilesToOptions(
    result.response ?? []
  );
};

export const fetchGrupos = async (
  signal?: AbortSignal
): Promise<SelectOption<string>[]> => {
  const result =
    await apiClient<
      GetGruposResponse
    >(
      GESTION_USUARIOS_API_ENDPOINTS
        .getGrupos,
      {
        signal,
      }
    );

  assertSuccessfulCatalogResponse(
    result,
    'No se pudieron cargar los grupos.'
  );

  return mapGruposToOptions(
    result.response ?? []
  );
};

export const fetchSubZonasGeneral = async (
  signal?: AbortSignal
): Promise<SelectOption<string>[]> => {
  const result =
    await apiClient<
      GetSubZonasGeneralResponse
    >(
      GESTION_USUARIOS_API_ENDPOINTS
        .getSubZonasGeneral,
      {
        signal,
      }
    );

  assertSuccessfulCatalogResponse(
    result,
    'No se pudieron cargar las sub zonas.'
  );

  return mapSubZonasToOptions(
    result.response ?? []
  );
};

export const fetchCampanasDiscadorByUsuario =
  async (
    idUsuario: string,
    signal?: AbortSignal
  ): Promise<
    CampanaDiscadorOption[]
  > => {
    const parsedId =
      Number(idUsuario);

    if (
      !Number.isInteger(
        parsedId
      ) ||
      parsedId <= 0
    ) {
      throw new Error(
        'No se pudo identificar al usuario para cargar las campañas del discador.'
      );
    }

    const params =
      new URLSearchParams({
        nId_Usuario:
          String(parsedId),
      });

    const result =
      await apiClient<
        GetCampanasDiscadorResponse
      >(
        `${
          GESTION_USUARIOS_API_ENDPOINTS
            .getCampanasDiscadorByUsuario
        }?${params.toString()}`,
        {
          signal,
        }
      );

    assertSuccessfulCatalogResponse(
      result,
      'No se pudieron cargar las campañas del discador.'
    );

    return mapCampanasDiscadorToOptions(
      result.response ?? []
    );
  };