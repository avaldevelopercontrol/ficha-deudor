import { useCallback } from 'react';

import { useApiResource } from '@shared/hooks/useApiResource';

import {
  fetchBotones,
  fetchColumnas,
} from '../api/documentosApi';
import { DOCUMENTOS_ERROR_MESSAGES } from '../constants/documentos.constants';

import type { FichaDeudorDocumentosParams } from '../../../shared/types/fichaDeudor.types';
import { getErrorMessage } from '../../../shared/utils/getErrorMessage';
import type {
  BotonApi,
  ColumnApi,
} from '../../../shared/types';

const EMPTY_DOCUMENTOS_COLUMNS: ColumnApi[] = [];
const EMPTY_DOCUMENTOS_BOTONES: BotonApi[] = [];

type DocumentosMetadataParams = Pick<
  FichaDeudorDocumentosParams,
  'id_cliente' | 'id_contrato'
>;

const hasRequiredColumnsParams = ({
  id_cliente,
  id_contrato,
}: DocumentosMetadataParams): boolean => {
  return Boolean(id_cliente && id_contrato);
};

const hasRequiredBotonesParams = ({
  id_cliente,
}: Pick<DocumentosMetadataParams, 'id_cliente'>): boolean => {
  return Boolean(id_cliente);
};

export const useDocumentosMetadata = (
  params: DocumentosMetadataParams
) => {
  const {
    id_cliente,
    id_contrato,
  } = params;

  const canLoadColumns =
    hasRequiredColumnsParams({
      id_cliente,
      id_contrato,
    });

  const canLoadBotones =
    hasRequiredBotonesParams({
      id_cliente,
    });

  const fetchColumnsResource = useCallback(
    async (signal: AbortSignal): Promise<ColumnApi[]> => {
      try {
        return await fetchColumnas(
          {
            idCliente: id_cliente,
            idContrato: id_contrato,
          },
          signal
        );
      } catch (error) {
        throw new Error(
          getErrorMessage(
            error,
            DOCUMENTOS_ERROR_MESSAGES.HEADERS
          )
        );
      }
    },
    [id_cliente, id_contrato]
  );

  const fetchBotonesResource = useCallback(
    async (signal: AbortSignal): Promise<BotonApi[]> => {
      try {
        return await fetchBotones(
          { idCliente: id_cliente },
          signal
        );
      } catch (error) {
        throw new Error(
          getErrorMessage(
            error,
            DOCUMENTOS_ERROR_MESSAGES.BUTTONS
          )
        );
      }
    },
    [id_cliente]
  );

  const {
    data: columns,
    isLoading: columnsLoading,
    error: columnsError,
    refetch: refetchColumns,
  } = useApiResource<ColumnApi[]>(
    fetchColumnsResource,
    [id_cliente, id_contrato],
    {
      enabled: canLoadColumns,
      initialLoading: canLoadColumns,
      errorMessage: DOCUMENTOS_ERROR_MESSAGES.HEADERS,
    }
  );

  const {
    data: botones,
    isLoading: botonesLoading,
    error: botonesError,
    refetch: refetchBotones,
  } = useApiResource<BotonApi[]>(
    fetchBotonesResource,
    [id_cliente],
    {
      enabled: canLoadBotones,
      initialLoading: canLoadBotones,
      errorMessage: DOCUMENTOS_ERROR_MESSAGES.BUTTONS,
    }
  );

  const refetch = useCallback(async () => {
    await Promise.all([
      refetchColumns(),
      refetchBotones(),
    ]);
  }, [refetchColumns, refetchBotones]);

  return {
    columns: columns ?? EMPTY_DOCUMENTOS_COLUMNS,
    botones: botones ?? EMPTY_DOCUMENTOS_BOTONES,
    isLoading:
      columnsLoading || botonesLoading,
    error: columnsError || botonesError,
    refetch,
  };
};
