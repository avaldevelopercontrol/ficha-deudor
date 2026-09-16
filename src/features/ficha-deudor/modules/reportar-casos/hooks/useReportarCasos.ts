import { useCallback, useMemo } from 'react';

import { useNullableResourceById } from '@shared/hooks/useNullableResourceById';

import { usePopupTableResource } from '../../../shared/hooks/popups/usePopupTableResource';
import {
  fetchReportarCasoById,
  fetchReportarCasos,
} from '../api/reportarCasosApi';
import type {
  ReportarCaso,
  ReportarCasoByIdApi,
} from '../types/reportarCaso.types';

const REPORTAR_CASOS_MESSAGES = {
  missingParams:
    'Faltan parámetros: id_cliente, id_cartera o id_deudor',
  loadError: 'Error cargando casos reportados',
  byIdError: 'Error cargando el caso para editar',
} as const;

export const useReportarCasos = (
  idCliente: string,
  idCartera: string,
  idDeudor: string
) => {
  const resetDeps = useMemo(
    () => [idCliente, idCartera, idDeudor] as const,
    [idCliente, idCartera, idDeudor]
  );

  const fetcher = useCallback(
    (signal: AbortSignal) =>
      fetchReportarCasos(
        { idCliente, idCartera, idDeudor },
        signal
      ),
    [idCliente, idCartera, idDeudor]
  );

  return usePopupTableResource<ReportarCaso>({
    areParamsReady: Boolean(idCliente && idCartera && idDeudor),
    missingParamsError: REPORTAR_CASOS_MESSAGES.missingParams,
    loadError: REPORTAR_CASOS_MESSAGES.loadError,
    resetDeps,
    fetcher,
    initialPageSize: 10,
  });
};


export const useReportarCasoById = (idCaso: string | null) => {
  const fetcher = useCallback(
    (id: string, signal: AbortSignal) =>
      fetchReportarCasoById({ idCaso: id }, signal),
    []
  );

  return useNullableResourceById<string, ReportarCasoByIdApi>({
    id: idCaso,
    fetcher,
    errorMessage: REPORTAR_CASOS_MESSAGES.byIdError,
  });
};
