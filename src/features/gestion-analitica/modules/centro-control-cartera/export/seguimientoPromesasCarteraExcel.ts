import {
  formatDateTimeInPeru,
} from '@shared/utils/peruDateTime.utils';

import type {
  PortfolioOperationalContext,
} from '../domain/panoramaCartera.types';
import type {
  PortfolioSortDirection,
  SeguimientoPromesaCarteraItem,
  SeguimientoPromesasCarteraPeriodo,
  SeguimientoPromesasCarteraSortKey,
  SeguimientoPromesasCarteraStatusFilter,
} from '../domain/promesasCartera.types';
import {
  buildSeguimientoPromesasStylesXml,
  buildSeguimientoPromesasWorksheetXml,
  SEGUIMIENTO_PROMESAS_STATUS_LABELS,
} from './seguimientoPromesasCarteraWorksheet';
import {
  buildSingleSheetXlsxBlob,
} from './xlsx/singleSheetXlsx';

interface SeguimientoPromesasExcelParams {
  items: readonly SeguimientoPromesaCarteraItem[];
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
  exportedAt?: Date;
}

export interface SeguimientoPromesasExcelFile {
  blob: Blob;
  fileName: string;
}

const sanitizeFileNamePart = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48) || 'Todos';

const buildFileName = (
  dueDate: string,
  status: SeguimientoPromesasCarteraStatusFilter,
  exportedAt: Date
): string => {
  const timestamp = formatDateTimeInPeru(exportedAt)
    .replace(/[-:.T]/g, '')
    .slice(0, 14);
  const statusPart = sanitizeFileNamePart(
    SEGUIMIENTO_PROMESAS_STATUS_LABELS[status]
  );

  return `Seguimiento_Promesas_${dueDate}_${statusPart}_${timestamp}.xlsx`;
};

export const buildSeguimientoPromesasExcelFile = (
  params: SeguimientoPromesasExcelParams
): SeguimientoPromesasExcelFile => {
  const exportedAt = params.exportedAt ?? new Date();
  const worksheetParams = {
    ...params,
    operationAsOfAt: params.operationAsOfAt ?? null,
    exportedAt,
  };

  return {
    blob: buildSingleSheetXlsxBlob({
      sheetName: 'Seguimiento',
      worksheetXml: buildSeguimientoPromesasWorksheetXml(worksheetParams),
      stylesXml: buildSeguimientoPromesasStylesXml(),
      documentTitle: 'Seguimiento de promesas',
      creator: 'SISGES',
      exportedAt,
    }),
    fileName: buildFileName(params.dueDate, params.status, exportedAt),
  };
};
