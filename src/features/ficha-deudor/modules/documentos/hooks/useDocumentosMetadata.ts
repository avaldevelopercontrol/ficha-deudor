import { useCallback } from 'react';

import { useApiResource } from '@shared/hooks/useApiResource';

import { fetchColumnas } from '../api/documentosApi';
import { DOCUMENTOS_ERROR_MESSAGES } from '../constants/documentos.constants';

import type { FichaDeudorDocumentosParams } from '../../../shared/types/fichaDeudor.types';
import { getErrorMessage } from '../../../shared/utils/getErrorMessage';
import type { ColumnApi } from '../../../shared/types';

const EMPTY_DOCUMENTOS_COLUMNS: ColumnApi[] = [];

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

  const {
    data: columns,
    isLoading,
    error,
    refetch,
  } = useApiResource<ColumnApi[]>(
    fetchColumnsResource,
    [id_cliente, id_contrato],
    {
      enabled: canLoadColumns,
      initialLoading: canLoadColumns,
      errorMessage: DOCUMENTOS_ERROR_MESSAGES.HEADERS,
    }
  );

  return {
    columns: columns ?? EMPTY_DOCUMENTOS_COLUMNS,
    isLoading,
    error,
    refetch,
  };
};
