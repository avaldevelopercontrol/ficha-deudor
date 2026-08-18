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
  EditarUsuarioCatalogErrors,
  EditarUsuarioCatalogLoading,
  EditarUsuarioCatalogos,
} from '../types/editarUsuario.types';

interface UseEditarUsuarioCatalogosParams {
  enabled: boolean;
  idUsuario: number | null;
}

const emptyStringOptions = ():
  SelectOption<string>[] => [];

const emptyCampanaOptions = ():
  CampanaDiscadorOption[] => [];

export const useEditarUsuarioCatalogos = ({
  enabled,
  idUsuario,
}: UseEditarUsuarioCatalogosParams) => {
  const perfilesFetcher =
    useCallback(
      (signal: AbortSignal) =>
        enabled
          ? fetchPerfiles(signal)
          : Promise.resolve(
              emptyStringOptions()
            ),
      [enabled]
    );

  const subZonasFetcher =
    useCallback(
      (signal: AbortSignal) =>
        enabled
          ? fetchSubZonasGeneral(
              signal
            )
          : Promise.resolve(
              emptyStringOptions()
            ),
      [enabled]
    );

  const campanasFetcher =
    useCallback(
      (signal: AbortSignal) => {
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
          String(idUsuario),
          signal
        );
      },
      [enabled, idUsuario]
    );

  const perfilesResource =
    useApiResource(
      perfilesFetcher,
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
      [enabled, idUsuario]
    );

  const departamentosResource =
    useDepartamentos(enabled);

  const catalogos =
    useMemo<EditarUsuarioCatalogos>(
      () => ({
        perfiles:
          perfilesResource.data ?? [],
        estados:
          ESTADO_ACTIVO_INACTIVO_OPTIONS,
        sexos:
          SEXOS_USUARIO_OPTIONS,
        departamentosLabor:
          departamentosResource.data?.map(
            ({ id, nombre }) => ({
              id,
              label: nombre,
            })
          ) ?? [],
        subZonalesOficina:
          subZonasResource.data ?? [],
        campanasDiscador:
          campanasResource.data ?? [],
      }),
      [
        perfilesResource.data,
        departamentosResource.data,
        subZonasResource.data,
        campanasResource.data,
      ]
    );

  const loading:
    EditarUsuarioCatalogLoading = {
      perfiles:
        perfilesResource.isLoading,
      departamentosLabor:
        departamentosResource.isLoading,
      subZonalesOficina:
        subZonasResource.isLoading,
      campanasDiscador:
        campanasResource.isLoading,
    };

  const errors:
    EditarUsuarioCatalogErrors = {
      perfiles:
        perfilesResource.error ??
        undefined,
      departamentosLabor:
        departamentosResource.error ??
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
  };
};
