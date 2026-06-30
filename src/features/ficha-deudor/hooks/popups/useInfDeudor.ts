import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchInfDeudorCabeceraFalse,
  fetchInfDeudorCabeceraTrue,
  fetchInfDeudorParams,
} from '../../api/popups/infDeudorApi';
import type { InfDeudorTableRow, InfDeudorCabeceraApi, InfDeudorParamApi } from '../../../../shared/types';

interface UseInfDeudorReturn {
  rows: InfDeudorTableRow[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

function buildRow(
  id: string,
  tipo: string,
  source: InfDeudorCabeceraApi | InfDeudorParamApi,
  prefix: 'cNombre_Param' | 'cPersInf_Param'
): InfDeudorTableRow {
  const row: InfDeudorTableRow = { id, tipo };

  for (let i = 1; i <= 80; i++) {
    const idx = i.toString().padStart(2, '0');
    const apiKey = `${prefix}${idx}`;
    const val = (source as Record<string, unknown>)[apiKey];
    // ← vacío "" en vez de "—"
    row[`param${idx}`] = typeof val === 'string' ? val : '';
  }

  return row;
}

export function useInfDeudor(id_deudor: string): UseInfDeudorReturn {
  const [rows, setRows] = useState<InfDeudorTableRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  const loadData = useCallback(async (signal: AbortSignal) => {
    if (!id_deudor) { setError('Falta id_deudor'); return; }

    setIsLoading(true);
    setError(null);

    try {
      const [cabFalse, cabTrue, params] = await Promise.all([
        fetchInfDeudorCabeceraFalse(signal),
        fetchInfDeudorCabeceraTrue(signal),
        fetchInfDeudorParams(id_deudor, signal),
      ]);
      if (signal.aborted) return;

      if (isMountedRef.current) {
        setRows([
          buildRow('cab_false', 'Cabecera Principal (false)', cabFalse, 'cNombre_Param'),
          buildRow('cab_true', 'Cabecera Adicional (true)', cabTrue, 'cNombre_Param'),
          buildRow('valores', 'Valores Deudor', params, 'cPersInf_Param'),
        ]);
      }
    } catch (err) {
      if (!signal.aborted && isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Error cargando información');
      }
    } finally {
      if (!signal.aborted && isMountedRef.current) setIsLoading(false);
    }
  }, [id_deudor]);

  useEffect(() => {
    if (!id_deudor) return;
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [id_deudor, loadData]);

  const refetch = useCallback(() => {
    if (!id_deudor) return;
    const controller = new AbortController();
    loadData(controller.signal);
  }, [id_deudor, loadData]);

  return { rows, isLoading, error, refetch };
}