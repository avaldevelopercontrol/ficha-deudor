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

interface DocumentosMetadata {
  columns: ColumnApi[];
  botones: BotonApi[];
}

const EMPTY_METADATA: DocumentosMetadata = {
  columns: [],
  botones: [],
};

const hasRequiredMetaParams = ({
  id_cliente,
  id_cartera,
  id_deudor,
  id_contrato,
  id_usuario,
}: FichaDeudorDocumentosParams) => {
  return Boolean(
    id_cliente &&
      id_cartera &&
      id_deudor &&
      id_contrato &&
      id_usuario
  );
};

export const useDocumentosMetadata = (
  params: FichaDeudorDocumentosParams
) => {
  const {
    id_cliente,
    id_cartera,
    id_deudor,
    id_contrato,
    id_usuario,
  } = params;

  const canLoadMetadata =
    hasRequiredMetaParams({
      id_cliente,
      id_cartera,
      id_deudor,
      id_contrato,
      id_usuario,
    });

  const fetchMetadata = useCallback(
    async (
      signal: AbortSignal
    ): Promise<DocumentosMetadata> => {
      if (!canLoadMetadata) {
        return EMPTY_METADATA;
      }

      try {
        const [columns, botones] =
          await Promise.all([
            fetchColumnas(
              id_cliente,
              id_contrato,
              signal
            ),
            fetchBotones(
              id_cliente,
              signal
            ),
          ]);

        return {
          columns,
          botones,
        };
      } catch (error) {
        throw new Error(
          getErrorMessage(
            error,
            DOCUMENTOS_ERROR_MESSAGES.META
          )
        );
      }
    },
    [
      canLoadMetadata,
      id_cliente,
      id_contrato,
    ]
  );

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useApiResource<DocumentosMetadata>(
    fetchMetadata,
    [
      id_cliente,
      id_cartera,
      id_deudor,
      id_contrato,
      id_usuario,
    ]
  );

  return {
    columns:
      data?.columns ??
      EMPTY_METADATA.columns,

    botones:
      data?.botones ??
      EMPTY_METADATA.botones,

    isLoading,
    error,
    refetch,
  };
};