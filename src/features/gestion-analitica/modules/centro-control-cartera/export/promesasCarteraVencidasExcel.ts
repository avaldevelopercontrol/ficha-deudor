import {
  formatDateTimeInPeru,
} from '@shared/utils/peruDateTime.utils';

import type {
  PortfolioOperationalContext,
} from '../domain/panoramaCartera.types';
import type {
  PortfolioOverdueAgingFilter,
  PortfolioOverduePromiseItem,
  PortfolioSortDirection,
  PromesasCarteraVencidasSortKey,
} from '../domain/promesasCartera.types';
import {
  buildPromesasCarteraStylesXml,
} from './promesasCarteraExcelStyles';
import {
  buildPromesasCarteraVencidasWorksheetXml,
  PROMESAS_VENCIDAS_AGING_LABELS,
} from './promesasCarteraVencidasWorksheet';
import {
  buildSingleSheetXlsxBlob,
} from './xlsx/singleSheetXlsx';

interface PromesasCarteraVencidasExcelParams {
  items: readonly PortfolioOverduePromiseItem[];
  crmClientId: number;
  context: Pick<
    PortfolioOperationalContext,
    'businessUnit' | 'campaignId' | 'subPortfolioId'
  >;
  aging: PortfolioOverdueAgingFilter;
  sortKey: PromesasCarteraVencidasSortKey;
  sortDirection: PortfolioSortDirection;
  asOfDate: string | null;
  updatedAt: string | null;
  exportedAt?: Date;
}

export interface PromesasCarteraVencidasExcelFile {
  blob: Blob;
  fileName: string;
}

const sanitizeFileNamePart = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48) || 'Todas';

const buildFileName = (
  asOfDate: string | null,
  aging: PortfolioOverdueAgingFilter,
  exportedAt: Date
): string => {
  const timestamp = formatDateTimeInPeru(exportedAt)
    .replace(/[-:.T]/g, '')
    .slice(0, 14);
  const datePart = /^\d{4}-\d{2}-\d{2}$/.test(asOfDate ?? '')
    ? asOfDate
    : 'sin-corte';
  const agingPart = sanitizeFileNamePart(
    PROMESAS_VENCIDAS_AGING_LABELS[aging]
  );

  return `Promesas_Vencidas_Con_Saldo_${datePart}_${agingPart}_${timestamp}.xlsx`;
};

export const buildPromesasCarteraVencidasExcelFile = (
  params: PromesasCarteraVencidasExcelParams
): PromesasCarteraVencidasExcelFile => {
  const exportedAt = params.exportedAt ?? new Date();

  return {
    blob: buildSingleSheetXlsxBlob({
      sheetName: 'Vencidas con saldo',
      worksheetXml: buildPromesasCarteraVencidasWorksheetXml({
        ...params,
        exportedAt,
      }),
      stylesXml: buildPromesasCarteraStylesXml(),
      documentTitle: 'Promesas vencidas con saldo',
      creator: 'SISGES',
      exportedAt,
    }),
    fileName: buildFileName(params.asOfDate, params.aging, exportedAt),
  };
};
