import { useCallback } from 'react';

import { useApiResource } from '@shared/hooks/useApiResource';

import { fetchAllGestiones } from '../api/documentosApi';
import { DOCUMENTOS_ERROR_MESSAGES } from '../constants/documentos.constants';

import type { FichaDeudorDocumentosParams } from '../../../shared/types/fichaDeudor.types';
import { getErrorMessage } from '../../../shared/utils/getErrorMessage';
import type { DocumentoApi } from '../../../shared/types';

const EMPTY_DOCUMENTOS_DATA: DocumentoApi[] = [];

type DocumentosDataParams = Pick<
  FichaDeudorDocumentosParams,
  'id_cliente' | 'id_cartera' | 'id_deudor'
>;

const hasRequiredDataParams = ({
  id_cliente,
  id_cartera,
  id_deudor,
}: DocumentosDataParams): boolean => {
  return Boolean(
    id_cliente &&
      id_cartera &&
      id_deudor
  );
};

export const useDocumentosData = (
  params: DocumentosDataParams
) => {
  const {
    id_cliente,
    id_cartera,
    id_deudor,
  } = params;

  const canLoadData =
    hasRequiredDataParams({
      id_cliente,
      id_cartera,
      id_deudor,
    });

  const fetchDocumentosData = useCallback(
    async (
      signal: AbortSignal
    ): Promise<DocumentoApi[]> => {
      try {
        return await fetchAllGestiones(
          {
            idCliente: id_cliente,
            idCartera: id_cartera,
            idDeudor: id_deudor,
          },
          signal
        );
      } catch (error) {
        throw new Error(
          getErrorMessage(
            error,
            DOCUMENTOS_ERROR_MESSAGES.DATA
          )
        );
      }
    },
    [id_cliente, id_cartera, id_deudor]
  );

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useApiResource<DocumentoApi[]>(
    fetchDocumentosData,
    [
      id_cliente,
      id_cartera,
      id_deudor,
    ],
    {
      enabled: canLoadData,
      initialLoading: canLoadData,
      errorMessage: DOCUMENTOS_ERROR_MESSAGES.DATA,
    }
  );

  return {
    rawData: data ?? EMPTY_DOCUMENTOS_DATA,
    isLoading,
    error,
    refetch,
  };
};
