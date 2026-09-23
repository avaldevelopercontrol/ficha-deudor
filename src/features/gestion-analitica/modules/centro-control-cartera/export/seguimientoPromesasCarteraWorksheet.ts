import type {
  PortfolioOperationalContext,
} from '../domain/panoramaCartera.types';
import type {
  PortfolioSortDirection,
  SeguimientoPromesaCarteraItem,
  SeguimientoPromesasCarteraPeriodo,
  SeguimientoPromesasCarteraSortKey,
  SeguimientoPromesasCarteraStatusFilter,
  SeguimientoPromesasCarteraStatusKey,
} from '../domain/promesasCartera.types';
import {
  formatPortfolioUpdatedAt,
} from '../utils/centroControlCartera.formatters';
import {
  formatPortfolioPromiseDate,
  formatSeguimientoPromesasPeriodLabel,
  getSeguimientoPromesaEmptyActivityLabel,
  getSeguimientoPromesaStatusLabel,
} from '../utils/detallePromesaCartera.utils';
import {
  buildMetadataRow,
  buildRowXml,
  columnNameFromIndex,
  padWorksheetRow,
  XML_HEADER,
  type WorksheetCell,
} from './xlsx/worksheetXml';

const COLUMN_COUNT = 20;
const TABLE_HEADER_ROW = 9;
const TABLE_FIRST_DATA_ROW = TABLE_HEADER_ROW + 1;

export const SEGUIMIENTO_PROMESAS_STATUS_LABELS: Readonly<
  Record<SeguimientoPromesasCarteraStatusFilter, string>
> = {
  all: 'Todos',
  pending: 'Pendiente',
  partial: 'Pago parcial',
  fulfilled: 'Cumplida',
  broken: 'Incumplida',
  'paid-out-of-range': 'Pagada fuera de plazo',
};

const SORT_LABELS: Readonly<
  Record<SeguimientoPromesasCarteraSortKey, string>
> = {
  debtorId: 'ID deudor',
  promiseAmount: 'Monto compromiso',
  paidAmount: 'Monto pagado',
  outstandingAmount: 'Saldo pendiente',
  statusLabel: 'Estado',
  lastPaymentDate: 'Fecha último pago',
  advisorName: 'Asesor',
  supervisorName: 'Supervisor',
};

const STATUS_STYLE_IDS: Readonly<
  Record<SeguimientoPromesasCarteraStatusKey, number>
> = {
  pending: 12,
  partial: 13,
  fulfilled: 14,
  broken: 12,
  'paid-out-of-range': 15,
};

export interface SeguimientoPromesasWorksheetParams {
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
  operationAsOfAt: string | null;
  exportedAt: Date;
}

const getConfirmationLabel = (value: boolean | null): string => {
  if (value === true) {
    return 'Confirmó pago';
  }

  if (value === false) {
    return 'No confirmó';
  }

  return 'Sin confirmación';
};

const getActivityLabel = (
  item: SeguimientoPromesaCarteraItem,
  period: SeguimientoPromesasCarteraPeriodo
): string =>
  item.managed
    ? 'Con gestión'
    : getSeguimientoPromesaEmptyActivityLabel(item.outstandingAmount, period);

const buildExportRows = (
  items: readonly SeguimientoPromesaCarteraItem[],
  period: SeguimientoPromesasCarteraPeriodo,
  dueDate: string
): WorksheetCell[][] =>
  items.map((item) => [
    { kind: 'string', value: item.promiseId || 'Sin ID', style: 6 },
    { kind: 'string', value: item.debtorId || 'Sin ID', style: 6 },
    {
      kind: 'string',
      value: item.debtorName?.trim() || `Deudor ${item.debtorId}`,
      style: 6,
    },
    { kind: 'date', value: item.dueDate ?? dueDate, style: 10 },
    { kind: 'string', value: getActivityLabel(item, period), style: 6 },
    { kind: 'string', value: item.managed ? 'Sí' : 'No', style: 7 },
    { kind: 'number', value: item.managementCount, style: 8 },
    { kind: 'number', value: item.callCount, style: 8 },
    { kind: 'string', value: item.contactLabel || 'Sin contacto', style: 6 },
    { kind: 'string', value: getConfirmationLabel(item.paymentConfirmed), style: 6 },
    { kind: 'date', value: item.lastManagementAt, style: 11 },
    { kind: 'number', value: item.promiseAmount, style: 9 },
    { kind: 'number', value: item.paidAmount, style: 9 },
    { kind: 'number', value: item.outstandingAmount, style: 9 },
    { kind: 'date', value: item.lastPaymentDate, style: 10 },
    {
      kind: 'string',
      value: getSeguimientoPromesaStatusLabel(
        item.statusKey,
        item.statusLabel || SEGUIMIENTO_PROMESAS_STATUS_LABELS[item.statusKey],
        item.lastPaymentDate,
        item.dueDate ?? dueDate
      ),
      style: STATUS_STYLE_IDS[item.statusKey],
    },
    { kind: 'string', value: item.advisorId ?? '', style: 6 },
    { kind: 'string', value: item.advisorName?.trim() || 'Sin asesor', style: 6 },
    { kind: 'string', value: item.supervisorId ?? '', style: 6 },
    {
      kind: 'string',
      value: item.supervisorName?.trim() || 'Sin supervisor',
      style: 6,
    },
  ]);

export const buildSeguimientoPromesasWorksheetXml = ({
  items,
  crmClientId,
  context,
  period,
  dueDate,
  status,
  sortKey,
  sortDirection,
  operationAsOfAt,
  exportedAt,
}: SeguimientoPromesasWorksheetParams): string => {
  const operationCutoffLabel = operationAsOfAt
    ? formatPortfolioUpdatedAt(operationAsOfAt)
    : 'No disponible';
  const exportedAtLabel = formatPortfolioUpdatedAt(exportedAt.toISOString());
  const formattedDueDate = formatPortfolioPromiseDate(dueDate, dueDate);
  const periodLabel = formatSeguimientoPromesasPeriodLabel(period, dueDate);
  const directionLabel = sortDirection === 'asc' ? 'Ascendente' : 'Descendente';
  const rows = buildExportRows(items, period, dueDate);
  const lastRow = Math.max(TABLE_HEADER_ROW, TABLE_HEADER_ROW + rows.length);
  const lastColumn = columnNameFromIndex(COLUMN_COUNT);

  const totalPromiseAmount = items.reduce(
    (sum, item) => sum + item.promiseAmount,
    0
  );
  const totalPaidAmount = items.reduce((sum, item) => sum + item.paidAmount, 0);
  const totalOutstandingAmount = items.reduce(
    (sum, item) => sum + item.outstandingAmount,
    0
  );

  const titleRow = padWorksheetRow(
    [{ kind: 'string', value: 'Seguimiento de promesas', style: 1 }],
    COLUMN_COUNT
  );
  const subtitleRow = padWorksheetRow(
    [
      {
        kind: 'string',
        value: `${periodLabel} · Exportación completa sin paginación`,
        style: 2,
      },
    ],
    COLUMN_COUNT
  );

  const metadataRow1 = buildMetadataRow([
    ['PERÍODO', { kind: 'string', value: period === 'today' ? 'Vencen hoy' : 'Vencieron ayer' }],
    ['FECHA VENCIMIENTO', { kind: 'string', value: formattedDueDate }],
    ['ESTADO', { kind: 'string', value: SEGUIMIENTO_PROMESAS_STATUS_LABELS[status] }],
    ['CLIENTE CRM', { kind: 'number', value: crmClientId }],
    ['CAMPAÑA', { kind: 'string', value: context.campaignId }],
  ], COLUMN_COUNT);

  const metadataRow2 = buildMetadataRow([
    ['UNIDAD NEGOCIO', { kind: 'string', value: context.businessUnit ?? 'Todas' }],
    ['SUBCARTERA', { kind: 'string', value: context.subPortfolioId ?? 'Todas' }],
    ['ORDEN', { kind: 'string', value: `${SORT_LABELS[sortKey]} · ${directionLabel}` }],
    ['REGISTROS', { kind: 'number', value: items.length, style: 18 }],
  ], COLUMN_COUNT);

  const timingRow = padWorksheetRow([
    {
      kind: 'string',
      value: `Corte de información: ${operationCutoffLabel}`,
      style: 2,
    },
    ...Array.from(
      { length: 9 },
      (): WorksheetCell => ({ kind: 'string', value: '' })
    ),
    {
      kind: 'string',
      value: `Exportado el: ${exportedAtLabel}`,
      style: 2,
    },
  ], COLUMN_COUNT);

  const summaryRow = padWorksheetRow([
    { kind: 'string', value: 'Promesas', style: 16 },
    { kind: 'number', value: items.length, style: 18 },
    { kind: 'string', value: '' },
    { kind: 'string', value: 'Monto comprometido', style: 16 },
    { kind: 'number', value: totalPromiseAmount, style: 17 },
    { kind: 'string', value: '' },
    { kind: 'string', value: 'Monto pagado', style: 16 },
    { kind: 'number', value: totalPaidAmount, style: 17 },
    { kind: 'string', value: '' },
    { kind: 'string', value: 'Saldo pendiente', style: 16 },
    { kind: 'number', value: totalOutstandingAmount, style: 17 },
  ], COLUMN_COUNT);

  const headers = padWorksheetRow(
    [
      'ID promesa',
      'ID deudor',
      'Deudor',
      'Fecha vencimiento',
      'Actividad',
      'Gestionado',
      'Gestiones',
      'Llamadas',
      'Contacto',
      'Confirmación de pago',
      'Última gestión',
      'Monto compromiso',
      'Monto pagado',
      'Saldo pendiente',
      'Fecha último pago',
      'Estado',
      'ID asesor',
      'Asesor',
      'ID supervisor',
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
    <col min="1" max="1" width="18" customWidth="1"/>
    <col min="2" max="2" width="15" customWidth="1"/>
    <col min="3" max="3" width="32" customWidth="1"/>
    <col min="4" max="4" width="16" customWidth="1"/>
    <col min="5" max="5" width="24" customWidth="1"/>
    <col min="6" max="8" width="12" customWidth="1"/>
    <col min="9" max="10" width="20" customWidth="1"/>
    <col min="11" max="11" width="20" customWidth="1"/>
    <col min="12" max="14" width="17" customWidth="1"/>
    <col min="15" max="15" width="17" customWidth="1"/>
    <col min="16" max="16" width="24" customWidth="1"/>
    <col min="17" max="17" width="14" customWidth="1"/>
    <col min="18" max="18" width="28" customWidth="1"/>
    <col min="19" max="19" width="14" customWidth="1"/>
    <col min="20" max="20" width="28" customWidth="1"/>
  </cols>
  <sheetData>
    ${buildRowXml(1, titleRow, 28)}
    ${buildRowXml(2, subtitleRow, 20)}
    ${buildRowXml(4, metadataRow1, 22)}
    ${buildRowXml(5, metadataRow2, 22)}
    ${buildRowXml(6, timingRow, 22)}
    ${buildRowXml(7, summaryRow, 22)}
    ${buildRowXml(TABLE_HEADER_ROW, headers, 30)}
    ${dataRowsXml}
  </sheetData>
  <autoFilter ref="A${TABLE_HEADER_ROW}:${lastColumn}${lastRow}"/>
  <mergeCells count="4">
    <mergeCell ref="A1:${lastColumn}1"/>
    <mergeCell ref="A2:${lastColumn}2"/>
    <mergeCell ref="A6:I6"/>
    <mergeCell ref="K6:${lastColumn}6"/>
  </mergeCells>
  <pageMargins left="0.25" right="0.25" top="0.5" bottom="0.5" header="0.2" footer="0.2"/>
  <pageSetup orientation="landscape" fitToWidth="1" fitToHeight="0"/>
</worksheet>`;
};
