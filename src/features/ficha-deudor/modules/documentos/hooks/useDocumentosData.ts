import { useCallback, useEffect, useState } from 'react';

import { fetchAllGestiones } from '../api/documentosApi';
import { DOCUMENTOS_ERROR_MESSAGES } from '../constants/documentos.constants';
import type { FichaDeudorDocumentosParams } from '../../../shared/types/fichaDeudor.types';
import { getErrorMessage } from '../../../shared/utils/errorMessage.utils';
import type { DocumentoApi } from '../../../shared/types';

const hasRequiredDataParams = ({
  id_cliente,
  id_cartera,
  id_deudor,
}: Pick<
  FichaDeudorDocumentosParams,
  'id_cliente' | 'id_cartera' | 'id_deudor'
>) => {
  return Boolean(id_cliente && id_cartera && id_deudor);
};

export const useDocumentosData = (
  params: FichaDeudorDocumentosParams
) => {
  const { id_cliente, id_cartera, id_deudor } = params;

  const [rawData, setRawData] = useState<DocumentoApi[]>([]);
  const [isLoading, setIsLoading] = useState(() =>
    hasRequiredDataParams({
      id_cliente,
      id_cartera,
      id_deudor,
    })
  );
  const [error, setError] = useState<string | null>(null);

  const fetchDocumentosData = useCallback(async () => {
    if (
      !hasRequiredDataParams({
        id_cliente,
        id_cartera,
        id_deudor,
      })
    ) {
      return [];
    }

    return fetchAllGestiones(id_cliente, id_cartera, id_deudor);
  }, [id_cliente, id_cartera, id_deudor]);

  useEffect(() => {
    let cancelled = false;

    const loadInitialData = async () => {
      try {
        const result = await fetchDocumentosData();

        if (cancelled) return;

        setRawData(result);
        setError(null);
      } catch (error) {
        if (cancelled) return;

        setError(getErrorMessage(error, DOCUMENTOS_ERROR_MESSAGES.DATA));
        setRawData([]);
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadInitialData();

    return () => {
      cancelled = true;
    };
  }, [fetchDocumentosData]);

  const refetch = useCallback(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await fetchDocumentosData();

        setRawData(result);
      } catch (error) {
        setError(getErrorMessage(error, DOCUMENTOS_ERROR_MESSAGES.DATA));
        setRawData([]);
      } finally {
        setIsLoading(false);
      }
    };

    void loadData();
  }, [fetchDocumentosData]);

  return {
    rawData,
    isLoading,
    error,
    refetch,
  };
};