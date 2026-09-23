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
  formatPortfolioUpdatedAt,
} from '../utils/centroControlCartera.formatters';
import {
  formatPortfolioPromiseDate,
} from '../utils/detallePromesaCartera.utils';
import {
  buildMetadataRow,
  buildRowXml,
  columnNameFromIndex,
  padWorksheetRow,
  XML_HEADER,
  type WorksheetCell,
} from './xlsx/worksheetXml';

const COLUMN_COUNT = 9;
const TABLE_HEADER_ROW = 10;
const TABLE_FIRST_DATA_ROW = TABLE_HEADER_ROW + 1;

export const PROMESAS_VENCIDAS_AGING_LABELS: Readonly<
  Record<PortfolioOverdueAgingFilter, string>
> = {
  all: 'Todas',
  '1-3': '1 - 3 días',
  '4-7': '4 - 7 días',
  '8-plus': '8+ días',
  unclassified: 'Sin fecha',
};

const SORT_LABELS: Readonly<
  Record<PromesasCarteraVencidasSortKey, string>
> = {
  debtorId: 'ID deudor (orden interno)',
  dueDate: 'Vencimiento',
  overdueDays: 'Días vencidos',
  promiseAmount: 'Prometido',
  paidAmount: 'Pagado',
  outstandingAmount: 'Pendiente',
  advisorName: 'Asesor',
  supervisorName: 'Supervisor',
};

export interface PromesasCarteraVencidasWorksheetParams {
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
  exportedAt: Date;
}

const buildExportRows = (
  items: readonly PortfolioOverduePromiseItem[]
): WorksheetCell[][] =>
  items.map((item) => [
    {
      kind: 'string',
      value: item.debtorName?.trim() || 'Sin nombre registrado',
      style: 6,
    },
    { kind: 'date', value: item.dueDate, style: 10 },
    item.overdueDays === null
      ? { kind: 'string', value: 'Sin fecha', style: 7 }
      : { kind: 'number', value: item.overdueDays, style: 8 },
    { kind: 'string', value: item.situationLabel, style: 6 },
    { kind: 'number', value: item.promiseAmount, style: 9 },
    { kind: 'number', value: item.paidAmount, style: 9 },
    { kind: 'number', value: item.outstandingAmount, style: 9 },
    {
      kind: 'string',
      value: item.advisorName?.trim() || 'Sin atribución',
      style: 6,
    },
    {
      kind: 'string',
      value: item.supervisorName?.trim() || 'Sin atribución',
      style: 6,
    },
  ]);

export const buildPromesasCarteraVencidasWorksheetXml = ({
  items,
  crmClientId,
  context,
  aging,
  sortKey,
  sortDirection,
  asOfDate,
  updatedAt,
  exportedAt,
}: PromesasCarteraVencidasWorksheetParams): string => {
  const rows = buildExportRows(items);
  const lastRow = Math.max(TABLE_HEADER_ROW, TABLE_HEADER_ROW + rows.length);
  const lastColumn = columnNameFromIndex(COLUMN_COUNT);
  const directionLabel = sortDirection === 'asc' ? 'Ascendente' : 'Descendente';
  const asOfDateLabel = asOfDate
    ? formatPortfolioPromiseDate(asOfDate, asOfDate)
    : 'No disponible';
  const updatedAtLabel = updatedAt
    ? formatPortfolioUpdatedAt(updatedAt)
    : 'No disponible';
  const exportedAtLabel = formatPortfolioUpdatedAt(exportedAt.toISOString());
  const totalPromiseAmount = items.reduce(
    (sum, item) => sum + item.promiseAmount,
    0
  );
  const totalPaidAmount = items.reduce(
    (sum, item) => sum + item.paidAmount,
    0
  );
  const totalOutstandingAmount = items.reduce(
    (sum, item) => sum + item.outstandingAmount,
    0
  );

  const titleRow = padWorksheetRow(
    [{ kind: 'string', value: 'Promesas vencidas con saldo', style: 1 }],
    COLUMN_COUNT
  );
  const subtitleRow = padWorksheetRow(
    [
      {
        kind: 'string',
        value: `${PROMESAS_VENCIDAS_AGING_LABELS[aging]} · Exportación completa sin paginación`,
        style: 2,
      },
    ],
    COLUMN_COUNT
  );
  const metadataRow1 = buildMetadataRow(
    [
      [
        'ANTIGÜEDAD',
        { kind: 'string', value: PROMESAS_VENCIDAS_AGING_LABELS[aging] },
      ],
      ['CLIENTE CRM', { kind: 'number', value: crmClientId }],
    ],
    COLUMN_COUNT
  );
  const metadataRow2 = buildMetadataRow(
    [
      [
        'UNIDAD NEGOCIO',
        { kind: 'string', value: context.businessUnit ?? 'Todas' },
      ],
      ['CAMPAÑA', { kind: 'string', value: context.campaignId }],
    ],
    COLUMN_COUNT
  );
  const metadataRow3 = buildMetadataRow(
    [
      [
        'SUBCARTERA',
        { kind: 'string', value: context.subPortfolioId ?? 'Todas' },
      ],
      [
        'ORDEN',
        {
          kind: 'string',
          value: `${SORT_LABELS[sortKey]} · ${directionLabel}`,
        },
      ],
    ],
    COLUMN_COUNT
  );
  const timingRow = padWorksheetRow(
    [
      {
        kind: 'string',
        value: `Corte: ${asOfDateLabel} · Actualizado: ${updatedAtLabel}`,
        style: 2,
      },
      { kind: 'string', value: '' },
      { kind: 'string', value: '' },
      { kind: 'string', value: '' },
      {
        kind: 'string',
        value: `Exportado el: ${exportedAtLabel}`,
        style: 2,
      },
    ],
    COLUMN_COUNT
  );
  const summaryRow = padWorksheetRow(
    [
      { kind: 'string', value: 'Registros', style: 16 },
      { kind: 'number', value: items.length, style: 18 },
      { kind: 'string', value: 'Prometido', style: 16 },
      { kind: 'number', value: totalPromiseAmount, style: 17 },
      { kind: 'string', value: 'Pagado', style: 16 },
      { kind: 'number', value: totalPaidAmount, style: 17 },
      { kind: 'string', value: 'Pendiente', style: 16 },
      { kind: 'number', value: totalOutstandingAmount, style: 17 },
    ],
    COLUMN_COUNT
  );
  const headers = padWorksheetRow(
    [
      'Deudor',
      'Vencimiento',
      'Días vencidos',
      'Situación',
      'Prometido',
      'Pagado',
      'Pendiente',
      'Asesor',
      'Supervisor',
    ].map<WorksheetCell>((value) => ({ kind: 'string', value, style: 5 })),
    COLUMN_COUNT
  );
  const dataRowsXml = rows
    .map((row, index) => buildRowXml(TABLE_FIRST_DATA_ROW + index, row, 28))
    .join('');

  return `${XML_HEADER}
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <dimension ref="A1:${lastColumn}${lastRow}"/>
  <sheetViews>
    <sheetView workbookViewId="0" showGridLines="0">
      <pane ySplit="${TABLE_HEADER_ROW}" topLeftCell="A${TABLE_FIRST_DATA_ROW}" activePane="bottomLeft" state="frozen"/>
      <selection pane="bottomLeft" activeCell="A${TABLE_FIRST_DATA_ROW}" sqref="A${TABLE_FIRST_DATA_ROW}"/>
    </sheetView>
  </sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <cols>
    <col min="1" max="1" width="30" customWidth="1"/>
    <col min="2" max="2" width="16" customWidth="1"/>
    <col min="3" max="3" width="15" customWidth="1"/>
    <col min="4" max="4" width="20" customWidth="1"/>
    <col min="5" max="7" width="17" customWidth="1"/>
    <col min="8" max="9" width="30" customWidth="1"/>
  </cols>
  <sheetData>
    ${buildRowXml(1, titleRow, 28)}
    ${buildRowXml(2, subtitleRow, 20)}
    ${buildRowXml(4, metadataRow1, 22)}
    ${buildRowXml(5, metadataRow2, 22)}
    ${buildRowXml(6, metadataRow3, 22)}
    ${buildRowXml(7, timingRow, 22)}
    ${buildRowXml(8, summaryRow, 22)}
    ${buildRowXml(TABLE_HEADER_ROW, headers, 30)}
    ${dataRowsXml}
  </sheetData>
  <autoFilter ref="A${TABLE_HEADER_ROW}:${lastColumn}${lastRow}"/>
  <mergeCells count="4">
    <mergeCell ref="A1:${lastColumn}1"/>
    <mergeCell ref="A2:${lastColumn}2"/>
    <mergeCell ref="A7:D7"/>
    <mergeCell ref="E7:${lastColumn}7"/>
  </mergeCells>
  <pageMargins left="0.25" right="0.25" top="0.5" bottom="0.5" header="0.2" footer="0.2"/>
  <pageSetup orientation="landscape" fitToWidth="1" fitToHeight="0"/>
</worksheet>`;
};
