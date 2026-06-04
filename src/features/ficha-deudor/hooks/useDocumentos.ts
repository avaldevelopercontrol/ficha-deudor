import { useState, useEffect, useCallback } from 'react';
import { fetchColumnas, fetchBotones, fetchGestiones } from '../api/gestionesApi';
import type { ColumnApi, DocumentoApi, BotonApi, ApiResponse } from '../../../shared/types/indexApi';

interface UseDocumentosReturn {
  columns: ColumnApi[];
  data: DocumentoApi[];
  botones: BotonApi[];
  isLoading: boolean;
  error: string | null;
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  setPageNumber: (page: number) => void;
  setPageSize: (size: number) => void;
  refetch: () => void;
}

export function useDocumentos(
  id_cliente: string,
  id_cartera: string,
  id_deudor: string,
  id_contrato:string,
): UseDocumentosReturn {

  const [columns, setColumns] = useState<ColumnApi[]>([]);
  const [botones, setBotones] = useState<BotonApi[]>([]);
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaError, setMetaError] = useState<string | null>(null);

  const [response, setResponse] = useState<ApiResponse<DocumentoApi> | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (!id_cliente || !id_cartera || !id_contrato) return;
    let cancelled = false;

    const loadMeta = async () => {
      setMetaLoading(true);
      setMetaError(null);
      try {
        const [cols, btns] = await Promise.all([
          fetchColumnas(id_cliente, id_contrato),
          fetchBotones(id_cliente, id_cartera),
        ]);
        if (!cancelled) {
          setColumns(cols);
          setBotones(btns);
        }
      } catch (err) {
        if (!cancelled) {
          setMetaError(err instanceof Error ? err.message : 'Error cargando metadatos');
        }
      } finally {
        if (!cancelled) setMetaLoading(false);
      }
    };

    loadMeta();
    return () => { cancelled = true; };
  }, [id_cliente, id_cartera, id_contrato]);

  useEffect(() => {
    if (!id_cliente || !id_cartera || !id_deudor) return;
    let cancelled = false;

    const loadData = async () => {
      setDataLoading(true);
      setDataError(null);
      try {
        const result = await fetchGestiones(
          id_cliente, id_cartera, id_deudor, pageNumber, pageSize
        );
        if (cancelled) return;
        if (result.statusCode !== 200) {
          throw new Error(result.message || 'Error en respuesta del servidor');
        }
        setResponse(result);
      } catch (err) {
        if (!cancelled) {
          setDataError(err instanceof Error ? err.message : 'Error cargando documentos');
          setResponse(null);
        }
      } finally {
        if (!cancelled) setDataLoading(false);
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, [id_cliente, id_cartera, id_deudor, pageNumber, pageSize]);

  useEffect(() => {
    setPageNumber(1);
  }, [id_cliente, id_cartera, id_deudor, pageSize]);

  const refetch = useCallback(() => {
    if (!id_cliente || !id_cartera || !id_deudor) return;
    let cancelled = false;
    setDataLoading(true);
    setDataError(null);

    fetchGestiones(id_cliente, id_cartera, id_deudor, pageNumber, pageSize)
      .then((result) => {
        if (cancelled) return;
        if (result.statusCode !== 200) {
          throw new Error(result.message || 'Error en respuesta del servidor');
        }
        setResponse(result);
      })
      .catch((err) => {
        if (!cancelled) {
          setDataError(err instanceof Error ? err.message : 'Error cargando documentos');
          setResponse(null);
        }
      })
      .finally(() => {
        if (!cancelled) setDataLoading(false);
      });

    return () => { cancelled = true; };
  }, [id_cliente, id_cartera, id_deudor, pageNumber, pageSize]);

  const isLoading = metaLoading || dataLoading;
  const error = metaError || dataError;

  return {
    columns,
    data: response?.response ?? [],
    botones,
    isLoading,
    error,
    pageNumber: response?.pageNumber ?? pageNumber,
    pageSize: response?.pageSize ?? pageSize,
    totalRecords: response?.totalRecords ?? 0,
    totalPages: response?.totalPages ?? 0,
    setPageNumber,
    setPageSize,
    refetch,
  };
}
