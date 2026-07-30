import {
  apiClient,
} from '@shared/api/apiClient';

import type {
  ApiResponseSimple,
} from '@shared/types/indexApi';

import {
  mapDepartamentos,
} from '../mappers/departamento.mapper';

import type {
  Departamento,
  DepartamentoApi,
} from '../types/departamento.types';

const DEPARTAMENTOS_ENDPOINT =
  '/v1/Direccion/GetDireccionDepartamentos';

const DEPARTAMENTOS_ERROR_MESSAGE =
  'No se pudieron cargar los departamentos.';

export const fetchDepartamentos = async (
  signal?: AbortSignal
): Promise<Departamento[]> => {
  const result =
    await apiClient<
      ApiResponseSimple<
        DepartamentoApi[]
      >
    >(
      DEPARTAMENTOS_ENDPOINT,
      {
        signal,
      }
    );

  if (
    result.statusCode < 200 ||
    result.statusCode >= 300
  ) {
    throw new Error(
      result.messageUser?.trim() ||
        result.message?.trim() ||
        DEPARTAMENTOS_ERROR_MESSAGE
    );
  }

  return mapDepartamentos(
    result.response ?? []
  );
};