import { useState, useEffect, useCallback } from 'react';
import { fetchGestionesRealizadas, fetchGestionesHistoricas } from '../api/gestionesRealizadasApi';
import { useClientSideTable, type TextFilters, type SelectedFilters } from '../../../shared/hooks/useClientSideTable';
import type { GestionRealizada, GestionCompleta } from '../../../shared/types';

// Re-exportar tipos para compatibilidad con los paneles
export type { TextFilters, SelectedFilters };

export interface UseGestionesRealizadasReturn {
  // ─── Resumido ───
  allData: GestionRealizada[];
  filteredData: GestionRealizada[];
  paginatedData: GestionRealizada[];
  isLoading: boolean;
  error: string | null;
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  setPageNumber: (page: number) => void;
  setPageSize: (size: number) => void;
  refetch: () => void;
  textFilters: TextFilters;
  selectedFilters: SelectedFilters;
  onTextFilterChange: (columnKey: string, value: string) => void;
  onSelectedFilterChange: (columnKey: string, values: string[]) => void;
  setResumido: React.Dispatch<React.SetStateAction<GestionRealizada[]>>;

  // ─── Expandido / Completo ───
  completo: GestionCompleta[];
  completoLoading: boolean;
  completoError: string | null;
  completoPageNumber: number;
  completoPageSize: number;
  completoTotalRecords: number;
  completoTotalPages: number;
  setCompletoPageNumber: (page: number) => void;
  setCompletoPageSize: (size: number) => void;
  refetchCompleto: () => void;
}

export function useGestionesRealizadas(
  id_cliente: string,
  id_cartera: string,
  id_deudor: string,
  id_usuario: string
): UseGestionesRealizadasReturn {
  // ═══════════════════════════════════════
  // ESTADO: Resumido (ahora con hook genérico)
  // ═══════════════════════════════════════
  const [allData, setAllData] = useState<GestionRealizada[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const table = useClientSideTable<GestionRealizada>(
    allData,
    [id_cliente, id_cartera, id_deudor, id_usuario],
    { initialPageSize: 10 }
  );

  // ═══════════════════════════════════════
  // ESTADO: Expandido / Completo (server-side, sin cambios)
  // ═══════════════════════════════════════
  const [completo, setCompleto] = useState<GestionCompleta[]>([]);
  const [completoLoading, setCompletoLoading] = useState(false);
  const [completoError, setCompletoError] = useState<string | null>(null);
  const [completoPageNumber, setCompletoPageNumber] = useState(1);
  const [completoPageSize, setCompletoPageSize] = useState(50);

  // ═══════════════════════════════════════
  // EFECTO: Cargar gestiones resumidas
  // ═══════════════════════════════════════
  useEffect(() => {
    if (!id_cliente || !id_cartera || !id_deudor || !id_usuario) return;

    const controller = new AbortController();

    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchGestionesRealizadas(id_cliente, id_cartera, id_deudor, id_usuario);
        if (controller.signal.aborted) return;
        setAllData(result.resumido);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Error cargando gestiones');
          setAllData([]);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    loadData();
    return () => controller.abort();
  }, [id_cliente, id_cartera, id_deudor, id_usuario]);

  // ═══════════════════════════════════════
  // EFECTO: Cargar gestiones históricas (completo)
  // ═══════════════════════════════════════
  useEffect(() => {
    if (!id_cliente || !id_cartera || !id_deudor) return;

    const controller = new AbortController();

    const loadCompleto = async () => {
      setCompletoLoading(true);
      setCompletoError(null);
      try {
        const result = await fetchGestionesHistoricas(
          id_cliente,
          id_cartera,
          id_deudor,
          completoPageNumber,
          completoPageSize
        );
        if (controller.signal.aborted) return;
        setCompleto(result.completo);
      } catch (err) {
        if (!controller.signal.aborted) {
          setCompletoError(err instanceof Error ? err.message : 'Error cargando gestiones históricas');
          setCompleto([]);
        }
      } finally {
        if (!controller.signal.aborted) setCompletoLoading(false);
      }
    };

    loadCompleto();
    return () => controller.abort();
  }, [id_cliente, id_cartera, id_deudor, completoPageNumber, completoPageSize]);

  // ═══════════════════════════════════════
  // Resetear página completa cuando cambia su pageSize
  // ═══════════════════════════════════════
  useEffect(() => {
    setCompletoPageNumber(1);
  }, [completoPageSize]);

  // ═══════════════════════════════════════
  // Refetch Resumido
  // ═══════════════════════════════════════
  const refetch = useCallback(() => {
    if (!id_cliente || !id_cartera || !id_deudor || !id_usuario) return;
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    fetchGestionesRealizadas(id_cliente, id_cartera, id_deudor, id_usuario)
      .then((result) => {
        if (controller.signal.aborted) return;
        setAllData(result.resumido);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err.message : 'Error cargando gestiones');
          setAllData([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [id_cliente, id_cartera, id_deudor, id_usuario]);

  // ═══════════════════════════════════════
  // Refetch Completo
  // ═══════════════════════════════════════
  const refetchCompleto = useCallback(() => {
    if (!id_cliente || !id_cartera || !id_deudor) return;
    const controller = new AbortController();
    setCompletoLoading(true);
    setCompletoError(null);

    fetchGestionesHistoricas(id_cliente, id_cartera, id_deudor, completoPageNumber, completoPageSize)
      .then((result) => {
        if (controller.signal.aborted) return;
        setCompleto(result.completo);
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          setCompletoError(err instanceof Error ? err.message : 'Error cargando gestiones históricas');
          setCompleto([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setCompletoLoading(false);
      });

    return () => controller.abort();
  }, [id_cliente, id_cartera, id_deudor, completoPageNumber, completoPageSize]);

  // ═══════════════════════════════════════
  // Setter expuesto para actualizar resumido desde fuera
  // ═══════════════════════════════════════
  const setResumido = useCallback((updater: React.SetStateAction<GestionRealizada[]>) => {
    setAllData(updater);
  }, []);

  return {
    // Resumido (desde useClientSideTable)
    allData,
    filteredData: table.filteredData,
    paginatedData: table.paginatedData,
    isLoading,
    error,
    pageNumber: table.pageNumber,
    pageSize: table.pageSize,
    totalRecords: table.totalRecords,
    totalPages: table.totalPages,
    setPageNumber: table.setPageNumber,
    setPageSize: table.setPageSize,
    refetch,
    textFilters: table.textFilters,
    selectedFilters: table.selectedFilters,
    onTextFilterChange: table.onTextFilterChange,
    onSelectedFilterChange: table.onSelectedFilterChange,
    setResumido,

    // Expandido / Completo (sin cambios)
    completo,
    completoLoading,
    completoError,
    completoPageNumber,
    completoPageSize,
    completoTotalRecords: completo.length,
    completoTotalPages: Math.max(1, Math.ceil(completo.length / completoPageSize)),
    setCompletoPageNumber,
    setCompletoPageSize,
    refetchCompleto,
  };
}