import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { downloadBlobFile } from '@shared/utils/downloadFile.utils';

import {
  loadAllSeguimientoPromesasCartera,
} from '../application/promesasCartera.application';
import type {
  PortfolioOperationalContext,
} from '../domain/panoramaCartera.types';
import type {
  PortfolioSortDirection,
  SeguimientoPromesasCarteraPeriodo,
  SeguimientoPromesasCarteraSortKey,
  SeguimientoPromesasCarteraStatusFilter,
} from '../domain/promesasCartera.types';
import {
  buildSeguimientoPromesasExcelFile,
} from '../export/seguimientoPromesasCarteraExcel';

interface UseSeguimientoPromesasCarteraExportParams {
  crmClientId: number;
  context: Pick<
    PortfolioOperationalContext,
    'businessUnit' | 'campaignId' | 'subPortfolioId'
  >;
  period: SeguimientoPromesasCarteraPeriodo;
  dueDate: string;
  status: SeguimientoPromesasCarteraStatusFilter;
  sortKey: SeguimientoPromesasCarteraSortKey;
  sortDirection: PortfolioSortDirection;
  operationAsOfAt?: string | null;
}

const getExportErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return 'No se pudo generar el archivo Excel. Intente nuevamente.';
};

export const useSeguimientoPromesasCarteraExport = ({
  crmClientId,
  context,
  period,
  dueDate,
  status,
  sortKey,
  sortDirection,
  operationAsOfAt = null,
}: UseSeguimientoPromesasCarteraExportParams) => {
  const [isExporting, setIsExporting] = useState(false);
  const [feedback, setFeedback] = useState<{
    key: string;
    error: string | null;
    exportedCount: number | null;
  } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const exportKey = [
    crmClientId,
    context.businessUnit ?? '',
    context.campaignId,
    context.subPortfolioId ?? '',
    period,
    dueDate,
    status,
    sortKey,
    sortDirection,
  ].join('|');

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    abortControllerRef.current?.abort();
  }, [exportKey]);

  const exportExcel = useCallback(async (): Promise<void> => {
    if (isExporting) {
      return;
    }

    abortControllerRef.current?.abort();

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsExporting(true);
    setFeedback(null);

    try {
      const items = await loadAllSeguimientoPromesasCartera(
        crmClientId,
        context,
        {
          dueDate,
          status: status === 'all' ? null : status,
          sortBy: sortKey,
          sortDirection,
        },
        abortController.signal
      );

      if (abortController.signal.aborted) {
        return;
      }

      const file = buildSeguimientoPromesasExcelFile({
        items,
        crmClientId,
        context,
        period,
        dueDate,
        status,
        sortKey,
        sortDirection,
        operationAsOfAt,
      });

      downloadBlobFile(file.blob, file.fileName);
      setFeedback({
        key: exportKey,
        error: null,
        exportedCount: items.length,
      });
    } catch (exportError) {
      if (
        exportError instanceof DOMException &&
        exportError.name === 'AbortError'
      ) {
        return;
      }

      setFeedback({
        key: exportKey,
        error: getExportErrorMessage(exportError),
        exportedCount: null,
      });
    } finally {
      if (abortControllerRef.current === abortController) {
        abortControllerRef.current = null;
        setIsExporting(false);
      }
    }
  }, [
    context,
    crmClientId,
    dueDate,
    exportKey,
    isExporting,
    operationAsOfAt,
    period,
    sortDirection,
    sortKey,
    status,
  ]);

  const currentFeedback = feedback?.key === exportKey ? feedback : null;

  return {
    isExporting,
    error: currentFeedback?.error ?? null,
    lastExportedCount: currentFeedback?.exportedCount ?? null,
    exportExcel,
  };
};
