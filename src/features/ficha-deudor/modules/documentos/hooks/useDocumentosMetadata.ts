import { useEffect, useState } from 'react';

import { fetchBotones, fetchColumnas } from '../api/documentosApi';
import { DOCUMENTOS_ERROR_MESSAGES } from '../constants/documentos.constants';
import type { FichaDeudorDocumentosParams } from '../../../shared/types/fichaDeudor.types';
import { getErrorMessage } from '../../../shared/utils/errorMessage.utils';
import type {
  BotonApi,
  ColumnApi,
} from '../../../shared/types';

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

  const [columns, setColumns] = useState<ColumnApi[]>([]);
  const [botones, setBotones] = useState<BotonApi[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (
    !hasRequiredMetaParams({
        id_cliente,
        id_cartera,
        id_deudor,
        id_contrato,
        id_usuario,
    })
    ) {
    return;
    }

    let cancelled = false;

    const loadMetadata = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [cols, btns] = await Promise.all([
          fetchColumnas(id_cliente, id_contrato),
          fetchBotones(id_cliente, id_cartera, id_deudor, id_usuario),
        ]);

        if (cancelled) return;

        setColumns(cols);
        setBotones(btns);
      } catch (error) {
        if (cancelled) return;

        setError(getErrorMessage(error, DOCUMENTOS_ERROR_MESSAGES.META));
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void loadMetadata();

    return () => {
      cancelled = true;
    };
  }, [
    id_cliente,
    id_cartera,
    id_deudor,
    id_contrato,
    id_usuario,
  ]);

  return {
    columns,
    botones,
    isLoading,
    error,
  };
};