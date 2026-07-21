import { useCallback } from 'react';

import { useApiResource } from '@shared/hooks/useApiResource';

import { fetchAllGestiones } from '../api/documentosApi';

import { DOCUMENTOS_ERROR_MESSAGES } from '../constants/documentos.constants';

import type { FichaDeudorDocumentosParams } from '../../../shared/types/fichaDeudor.types';

import { getErrorMessage } from '../../../shared/utils/getErrorMessage';

import type { DocumentoApi } from '../../../shared/types';

const hasRequiredDataParams = ({
  id_cliente,
  id_cartera,
  id_deudor,
}: Pick<
  FichaDeudorDocumentosParams,
  | 'id_cliente'
  | 'id_cartera'
  | 'id_deudor'
>) => {
  return Boolean(
    id_cliente &&
      id_cartera &&
      id_deudor
  );
};

export const useDocumentosData = (
  params: FichaDeudorDocumentosParams
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

  const fetchDocumentosData =
    useCallback(
      async (
        signal: AbortSignal
      ): Promise<DocumentoApi[]> => {
        if (!canLoadData) {
          return [];
        }

        try {
          return await fetchAllGestiones(
            id_cliente,
            id_cartera,
            id_deudor,
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
      [
        canLoadData,
        id_cliente,
        id_cartera,
        id_deudor,
      ]
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
    ]
  );

  return {
    rawData: data ?? [],
    isLoading,
    error,
    refetch,
  };
};