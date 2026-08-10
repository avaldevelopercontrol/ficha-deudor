import {
  useCallback,
  useMemo,
} from 'react';

import {
  useDepartamentos,
} from '@shared/catalogos/departamentos/hooks/useDepartamentos';

import {
  ESTADO_ACTIVO_INACTIVO_OPTIONS,
} from '@shared/constants/catalogOptions.constants';

import {
  useApiResource,
} from '@shared/hooks/useApiResource';

import type {
  SelectOption,
} from '@shared/types';

import {
  fetchCampanasDiscadorByUsuario,
  fetchGrupos,
  fetchPerfiles,
  fetchSubZonasGeneral,
} from '../../../api/usuarioCatalogosApi';

import {
  SEXOS_USUARIO_OPTIONS,
} from '../../../mocks/registrarUsuarioCatalogos.mocks';

import type {
  CampanaDiscadorOption,
} from '../../../types/usuarioCatalogos.types';

import type {
  RegistrarUsuarioCatalogErrors,
  RegistrarUsuarioCatalogLoading,
  RegistrarUsuarioCatalogos,
} from '../types/registrarUsuario.types';

interface UseRegistrarUsuarioCatalogosParams {
  enabled: boolean;
  idUsuario: string | null;
}

const emptyStringOptions = ():
  SelectOption<string>[] => [];

const emptyCampanaOptions = ():
  CampanaDiscadorOption[] => [];

export const useRegistrarUsuarioCatalogos = ({
  enabled,
  idUsuario,
}: UseRegistrarUsuarioCatalogosParams) => {
  const perfilesFetcher =
    useCallback(
      (
        signal: AbortSignal
      ) => {
        if (!enabled) {
          return Promise.resolve(
            emptyStringOptions()
          );
        }

        return fetchPerfiles(
          signal
        );
      },
      [enabled]
    );

  const gruposFetcher =
    useCallback(
      (
        signal: AbortSignal
      ) => {
        if (!enabled) {
          return Promise.resolve(
            emptyStringOptions()
          );
        }

        return fetchGrupos(
          signal
        );
      },
      [enabled]
    );

  const subZonasFetcher =
    useCallback(
      (
        signal: AbortSignal
      ) => {
        if (!enabled) {
          return Promise.resolve(
            emptyStringOptions()
          );
        }

        return fetchSubZonasGeneral(
          signal
        );
      },
      [enabled]
    );

  const campanasFetcher =
    useCallback(
      (
        signal: AbortSignal
      ) => {
        if (!enabled) {
          return Promise.resolve(
            emptyCampanaOptions()
          );
        }

        if (!idUsuario) {
          return Promise.reject(
            new Error(
              'No se pudo identificar al usuario para cargar las campañas del discador.'
            )
          );
        }

        return fetchCampanasDiscadorByUsuario(
          idUsuario,
          signal
        );
      },
      [
        enabled,
        idUsuario,
      ]
    );

  const perfilesResource =
    useApiResource(
      perfilesFetcher,
      [enabled]
    );

  const gruposResource =
    useApiResource(
      gruposFetcher,
      [enabled]
    );

  const subZonasResource =
    useApiResource(
      subZonasFetcher,
      [enabled]
    );

  const campanasResource =
    useApiResource(
      campanasFetcher,
      [
        enabled,
        idUsuario,
      ]
    );

  const departamentosResource =
    useDepartamentos(
      enabled
    );

  const catalogos =
    useMemo<
      RegistrarUsuarioCatalogos
    >(
      () => ({
        perfiles:
          perfilesResource.data ??
          [],

        grupos:
          gruposResource.data ??
          [],

        estados:
          ESTADO_ACTIVO_INACTIVO_OPTIONS,

        sexos:
          SEXOS_USUARIO_OPTIONS,

        departamentosLabor:
          departamentosResource
            .data
            ?.map(
              ({
                id,
                nombre,
              }) => ({
                id,
                label: nombre,
              })
            ) ?? [],

        subZonalesOficina:
        subZonasResource.data?.filter(
          (option) => option.id !== '0'
        ) ?? [],

        campanasDiscador:
          campanasResource.data ??
          [],
      }),
      [
        perfilesResource.data,
        gruposResource.data,
        departamentosResource.data,
        subZonasResource.data,
        campanasResource.data,
      ]
    );

  const loading:
    RegistrarUsuarioCatalogLoading = {
      perfiles:
        perfilesResource.isLoading,

      grupos:
        gruposResource.isLoading,

      departamentosLabor:
        departamentosResource
          .isLoading,

      subZonalesOficina:
        subZonasResource.isLoading,

      campanasDiscador:
        campanasResource.isLoading,
    };

  const errors:
    RegistrarUsuarioCatalogErrors = {
      perfiles:
        perfilesResource.error ??
        undefined,

      grupos:
        gruposResource.error ??
        undefined,

      departamentosLabor:
        departamentosResource
          .error ??
        undefined,

      subZonalesOficina:
        subZonasResource.error ??
        undefined,

      campanasDiscador:
        campanasResource.error ??
        undefined,
    };

  return {
    catalogos,
    loading,
    errors,

    isLoading:
      Object
        .values(loading)
        .some(Boolean),
  };
};