import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { downloadBlobFile } from '@shared/utils/downloadFile.utils';

import {
  loadAllPromesasCarteraVencidas,
} from '../application/promesasCartera.application';
import type {
  PortfolioOperationalContext,
} from '../domain/panoramaCartera.types';
import type {
  PortfolioOverdueAgingFilter,
  PortfolioSortDirection,
  PromesasCarteraVencidasSortKey,
} from '../domain/promesasCartera.types';

interface UsePromesasCarteraVencidasExportParams {
  crmClientId: number;
  context: Pick<
    PortfolioOperationalContext,
    'businessUnit' | 'campaignId' | 'subPortfolioId'
  >;
  aging: PortfolioOverdueAgingFilter;
  sortKey: PromesasCarteraVencidasSortKey;
  sortDirection: PortfolioSortDirection;
}

const getExportErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return 'No se pudo generar el archivo Excel. Intente nuevamente.';
};

export const usePromesasCarteraVencidasExport = ({
  crmClientId,
  context,
  aging,
  sortKey,
  sortDirection,
}: UsePromesasCarteraVencidasExportParams) => {
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
    aging,
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
      const [exportData, excelModule] = await Promise.all([
        loadAllPromesasCarteraVencidas(
          crmClientId,
          context,
          {
            aging: aging === 'all' ? null : aging,
            sortBy: sortKey,
            sortDirection,
          },
          abortController.signal
        ),
        import('../export/promesasCarteraVencidasExcel'),
      ]);

      if (abortController.signal.aborted) {
        return;
      }

      const file = excelModule.buildPromesasCarteraVencidasExcelFile({
        items: exportData.items,
        crmClientId,
        context,
        aging,
        sortKey,
        sortDirection,
        asOfDate: exportData.asOfDate,
        updatedAt: exportData.updatedAt,
      });

      downloadBlobFile(file.blob, file.fileName);
      setFeedback({
        key: exportKey,
        error: null,
        exportedCount: exportData.items.length,
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
    aging,
    context,
    crmClientId,
    exportKey,
    isExporting,
    sortDirection,
    sortKey,
  ]);

  const currentFeedback = feedback?.key === exportKey ? feedback : null;

  return {
    isExporting,
    error: currentFeedback?.error ?? null,
    lastExportedCount: currentFeedback?.exportedCount ?? null,
    exportExcel,
  };
};
