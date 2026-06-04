// hooks/useDualViewTable.ts
import { useState, useEffect, useCallback } from 'react';
import { usePaginatedTable, type UsePaginatedTableResult } from './usePaginatedTable';

interface UseDualViewTableOptions<TResumido, TExpandido> {
  dataResumido: TResumido[];
  dataExpandido: TExpandido[];
  defaultPageSize?: number;
  resetDeps?: React.DependencyList;
}

interface UseDualViewTableResult<TResumido, TExpandido> {
  vistaExpandida: boolean;
  setVistaExpandida: React.Dispatch<React.SetStateAction<boolean>>;
  handleVerMas: () => void;
  handleVolver: () => void;
  resumido: UsePaginatedTableResult<TResumido>;
  expandido: UsePaginatedTableResult<TExpandido>;
  resetAll: () => void;
}

export function useDualViewTable<TResumido extends object, TExpandido extends object>({
  dataResumido,
  dataExpandido,
  defaultPageSize = 5,
  resetDeps = [],
}: UseDualViewTableOptions<TResumido, TExpandido>): UseDualViewTableResult<TResumido, TExpandido> {
  const [vistaExpandida, setVistaExpandida] = useState(false);

  const resumido = usePaginatedTable<TResumido>({
    data: dataResumido,
    defaultPageSize,
    resetDeps,
  });

  const expandido = usePaginatedTable<TExpandido>({
    data: dataExpandido,
    defaultPageSize,
    resetDeps,
  });

  useEffect(() => {
    if (vistaExpandida) {
      expandido.setPaginaActual(1);
    } else {
      resumido.setPaginaActual(1);
    }
  }, [vistaExpandida]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleVerMas = useCallback(() => setVistaExpandida(true), []);
  const handleVolver = useCallback(() => setVistaExpandida(false), []);

  const resetAll = useCallback(() => {
    setVistaExpandida(false);
    resumido.resetAll();
    expandido.resetAll();
  }, [resumido, expandido]);

  useEffect(() => {
    resetAll();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, resetDeps);

  return {
    vistaExpandida,
    setVistaExpandida,
    handleVerMas,
    handleVolver,
    resumido,
    expandido,
    resetAll,
  };
}