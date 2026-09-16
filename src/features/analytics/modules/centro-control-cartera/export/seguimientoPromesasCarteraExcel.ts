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

const XLSX_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const COLUMN_COUNT = 20;
const TABLE_HEADER_ROW = 9;
const TABLE_FIRST_DATA_ROW = TABLE_HEADER_ROW + 1;

const STATUS_LABELS: Readonly<
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

type WorksheetCell =
  | { kind: 'string'; value: string; style?: number }
  | { kind: 'number'; value: number; style?: number }
  | { kind: 'date'; value: string | null; style?: number };

interface ZipEntry {
  name: string;
  data: Uint8Array;
}

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';

const escapeXml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

const sanitizeFileNamePart = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48) || 'Todos';

const columnNameFromIndex = (index: number): string => {
  let current = index;
  let result = '';

  while (current > 0) {
    const remainder = (current - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    current = Math.floor((current - 1) / 26);
  }

  return result;
};

const toExcelSerial = (value: string): number | null => {
  const normalized = value.trim();
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);

  if (dateOnly) {
    const utc = Date.UTC(
      Number(dateOnly[1]),
      Number(dateOnly[2]) - 1,
      Number(dateOnly[3])
    );

    return utc / 86_400_000 + 25_569;
  }

  const localDateTime =
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/.exec(
      normalized
    );

  if (localDateTime) {
    const utc = Date.UTC(
      Number(localDateTime[1]),
      Number(localDateTime[2]) - 1,
      Number(localDateTime[3]),
      Number(localDateTime[4]),
      Number(localDateTime[5]),
      Number(localDateTime[6] ?? 0)
    );

    return utc / 86_400_000 + 25_569;
  }

  return null;
};

const buildCellXml = (
  rowNumber: number,
  columnNumber: number,
  cell: WorksheetCell
): string => {
  const reference = `${columnNameFromIndex(columnNumber)}${rowNumber}`;
  const styleAttribute = cell.style === undefined ? '' : ` s="${cell.style}"`;

  if (cell.kind === 'number') {
    return `<c r="${reference}"${styleAttribute}><v>${cell.value}</v></c>`;
  }

  if (cell.kind === 'date') {
    if (!cell.value) {
      return `<c r="${reference}"${styleAttribute}/>`;
    }

    const serial = toExcelSerial(cell.value);

    if (serial !== null) {
      return `<c r="${reference}"${styleAttribute}><v>${serial}</v></c>`;
    }

    return `<c r="${reference}" t="inlineStr"${styleAttribute}><is><t xml:space="preserve">${escapeXml(
      cell.value
    )}</t></is></c>`;
  }

  return `<c r="${reference}" t="inlineStr"${styleAttribute}><is><t xml:space="preserve">${escapeXml(
    cell.value
  )}</t></is></c>`;
};

const buildRowXml = (
  rowNumber: number,
  cells: readonly WorksheetCell[],
  height?: number
): string => {
  const heightAttribute =
    height === undefined ? '' : ` ht="${height}" customHeight="1"`;

  return `<row r="${rowNumber}"${heightAttribute}>${cells
    .map((cell, index) => buildCellXml(rowNumber, index + 1, cell))
    .join('')}</row>`;
};

const padRow = (
  values: readonly WorksheetCell[],
  totalColumns = COLUMN_COUNT
): WorksheetCell[] => {
  const result = [...values];

  while (result.length < totalColumns) {
    result.push({ kind: 'string', value: '' });
  }

  return result;
};

const buildMetadataRow = (
  pairs: ReadonlyArray<readonly [string, WorksheetCell]>
): WorksheetCell[] => {
  const row: WorksheetCell[] = [];

  pairs.forEach(([label, value], pairIndex) => {
    if (pairIndex > 0) {
      row.push({ kind: 'string', value: '' });
    }

    row.push({ kind: 'string', value: label, style: 3 });
    row.push({ ...value, style: value.style ?? 4 });
  });

  return padRow(row);
};

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
        item.statusLabel || STATUS_LABELS[item.statusKey],
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

const buildStylesXml = (): string => `${XML_HEADER}
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <numFmts count="4">
    <numFmt numFmtId="164" formatCode="&quot;S/&quot; #,##0.00;[Red]-&quot;S/&quot; #,##0.00"/>
    <numFmt numFmtId="165" formatCode="dd/mm/yyyy"/>
    <numFmt numFmtId="166" formatCode="dd/mm/yyyy hh:mm"/>
    <numFmt numFmtId="167" formatCode="0"/>
  </numFmts>
  <fonts count="5">
    <font><sz val="11"/><name val="Calibri"/><family val="2"/></font>
    <font><b/><color rgb="FFFFFFFF"/><sz val="16"/><name val="Calibri"/></font>
    <font><color rgb="FF67728A"/><sz val="10"/><name val="Calibri"/></font>
    <font><b/><color rgb="FF1A2540"/><sz val="9"/><name val="Calibri"/></font>
    <font><b/><color rgb="FFFFFFFF"/><sz val="10"/><name val="Calibri"/></font>
  </fonts>
  <fills count="8">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF1A2540"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFF4F7FB"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFE8EC"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFFF4D6"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFE8F7ED"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFEDF0FF"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border>
      <left style="thin"><color rgb="FFD9DFE8"/></left>
      <right style="thin"><color rgb="FFD9DFE8"/></right>
      <top style="thin"><color rgb="FFD9DFE8"/></top>
      <bottom style="thin"><color rgb="FFD9DFE8"/></bottom>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="19">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="3" fillId="3" borderId="1" xfId="0"><alignment vertical="center"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="4" fillId="2" borderId="1" xfId="0"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="167" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="164" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1"><alignment horizontal="right" vertical="center"/></xf>
    <xf numFmtId="165" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="166" fontId="0" fillId="0" borderId="1" xfId="0" applyNumberFormat="1"><alignment horizontal="center" vertical="center"/></xf>
    <xf numFmtId="0" fontId="3" fillId="4" borderId="1" xfId="0"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="3" fillId="5" borderId="1" xfId="0"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="3" fillId="6" borderId="1" xfId="0"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="3" fillId="7" borderId="1" xfId="0"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="3" fillId="3" borderId="1" xfId="0"><alignment horizontal="right" vertical="center"/></xf>
    <xf numFmtId="164" fontId="3" fillId="0" borderId="1" xfId="0" applyNumberFormat="1"><alignment horizontal="right" vertical="center"/></xf>
    <xf numFmtId="167" fontId="3" fillId="0" borderId="1" xfId="0" applyNumberFormat="1"><alignment horizontal="right" vertical="center"/></xf>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>`;

const buildWorksheetXml = ({
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
}: Required<SeguimientoPromesasExcelParams>): string => {
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

  const titleRow = padRow([
    { kind: 'string', value: 'Seguimiento de promesas', style: 1 },
  ]);
  const subtitleRow = padRow([
    {
      kind: 'string',
      value: `${periodLabel} · Exportación completa sin paginación`,
      style: 2,
    },
  ]);

  const metadataRow1 = buildMetadataRow([
    ['PERÍODO', { kind: 'string', value: period === 'today' ? 'Vencen hoy' : 'Vencieron ayer' }],
    ['FECHA VENCIMIENTO', { kind: 'string', value: formattedDueDate }],
    ['ESTADO', { kind: 'string', value: STATUS_LABELS[status] }],
    ['CLIENTE CRM', { kind: 'number', value: crmClientId }],
    ['CAMPAÑA', { kind: 'string', value: context.campaignId }],
  ]);

  const metadataRow2 = buildMetadataRow([
    ['UNIDAD NEGOCIO', { kind: 'string', value: context.businessUnit ?? 'Todas' }],
    ['SUBCARTERA', { kind: 'string', value: context.subPortfolioId ?? 'Todas' }],
    ['ORDEN', { kind: 'string', value: `${SORT_LABELS[sortKey]} · ${directionLabel}` }],
    ['REGISTROS', { kind: 'number', value: items.length, style: 18 }],
  ]);

  const timingRow = padRow([
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
  ]);

  const summaryRow = padRow([
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
  ]);

  const headers = padRow(
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
    ].map<WorksheetCell>((value) => ({ kind: 'string', value, style: 5 }))
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

const buildWorkbookXml = (): string => `${XML_HEADER}
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <bookViews><workbookView xWindow="0" yWindow="0" windowWidth="24000" windowHeight="12000"/></bookViews>
  <sheets><sheet name="Seguimiento" sheetId="1" r:id="rId1"/></sheets>
</workbook>`;

const buildWorkbookRelationshipsXml = (): string => `${XML_HEADER}
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;

const buildRootRelationshipsXml = (): string => `${XML_HEADER}
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;

const buildContentTypesXml = (): string => `${XML_HEADER}
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;

const buildCorePropertiesXml = (exportedAt: Date): string => {
  const createdAt = exportedAt.toISOString();

  return `${XML_HEADER}
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Seguimiento de promesas</dc:title>
  <dc:creator>SISGES</dc:creator>
  <cp:lastModifiedBy>SISGES</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${createdAt}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${createdAt}</dcterms:modified>
</cp:coreProperties>`;
};

const buildAppPropertiesXml = (): string => `${XML_HEADER}
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>SISGES</Application>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
  <HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Hojas de cálculo</vt:lpstr></vt:variant><vt:variant><vt:i4>1</vt:i4></vt:variant></vt:vector></HeadingPairs>
  <TitlesOfParts><vt:vector size="1" baseType="lpstr"><vt:lpstr>Seguimiento</vt:lpstr></vt:vector></TitlesOfParts>
</Properties>`;

const CRC32_TABLE = (() => {
  const table = new Uint32Array(256);

  for (let index = 0; index < 256; index += 1) {
    let value = index;

    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }

    table[index] = value >>> 0;
  }

  return table;
})();

const crc32 = (data: Uint8Array): number => {
  let crc = 0xffffffff;

  data.forEach((byte) => {
    crc = CRC32_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  });

  return (crc ^ 0xffffffff) >>> 0;
};

const concatUint8Arrays = (arrays: readonly Uint8Array[]): Uint8Array => {
  const totalLength = arrays.reduce((sum, array) => sum + array.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  arrays.forEach((array) => {
    result.set(array, offset);
    offset += array.length;
  });

  return result;
};

const createZip = (entries: readonly ZipEntry[]): Uint8Array => {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let localOffset = 0;

  entries.forEach((entry) => {
    const nameBytes = encoder.encode(entry.name);
    const checksum = crc32(entry.data);
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(localHeader.buffer);

    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0x0800, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, 0, true);
    localView.setUint16(12, 0, true);
    localView.setUint32(14, checksum, true);
    localView.setUint32(18, entry.data.length, true);
    localView.setUint32(22, entry.data.length, true);
    localView.setUint16(26, nameBytes.length, true);
    localView.setUint16(28, 0, true);
    localHeader.set(nameBytes, 30);

    localParts.push(localHeader, entry.data);

    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(centralHeader.buffer);

    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0x0800, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, 0, true);
    centralView.setUint16(14, 0, true);
    centralView.setUint32(16, checksum, true);
    centralView.setUint32(20, entry.data.length, true);
    centralView.setUint32(24, entry.data.length, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, 0, true);
    centralView.setUint32(42, localOffset, true);
    centralHeader.set(nameBytes, 46);

    centralParts.push(centralHeader);
    localOffset += localHeader.length + entry.data.length;
  });

  const centralDirectory = concatUint8Arrays(centralParts);
  const endRecord = new Uint8Array(22);
  const endView = new DataView(endRecord.buffer);

  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(4, 0, true);
  endView.setUint16(6, 0, true);
  endView.setUint16(8, entries.length, true);
  endView.setUint16(10, entries.length, true);
  endView.setUint32(12, centralDirectory.length, true);
  endView.setUint32(16, localOffset, true);
  endView.setUint16(20, 0, true);

  return concatUint8Arrays([
    ...localParts,
    centralDirectory,
    endRecord,
  ]);
};

const stringEntry = (name: string, content: string): ZipEntry => ({
  name,
  data: new TextEncoder().encode(content),
});

const buildFileName = (
  dueDate: string,
  status: SeguimientoPromesasCarteraStatusFilter,
  exportedAt: Date
): string => {
  const timestamp = formatDateTimeInPeru(exportedAt)
    .replace(/[-:.T]/g, '')
    .slice(0, 14);
  const statusPart = sanitizeFileNamePart(STATUS_LABELS[status]);

  return `Seguimiento_Promesas_${dueDate}_${statusPart}_${timestamp}.xlsx`;
};

export const buildSeguimientoPromesasExcelFile = (
  params: SeguimientoPromesasExcelParams
): SeguimientoPromesasExcelFile => {
  const exportedAt = params.exportedAt ?? new Date();
  const completeParams: Required<SeguimientoPromesasExcelParams> = {
    ...params,
    operationAsOfAt: params.operationAsOfAt ?? null,
    exportedAt,
  };
  const workbookBytes = createZip([
    stringEntry('[Content_Types].xml', buildContentTypesXml()),
    stringEntry('_rels/.rels', buildRootRelationshipsXml()),
    stringEntry('docProps/core.xml', buildCorePropertiesXml(exportedAt)),
    stringEntry('docProps/app.xml', buildAppPropertiesXml()),
    stringEntry('xl/workbook.xml', buildWorkbookXml()),
    stringEntry('xl/_rels/workbook.xml.rels', buildWorkbookRelationshipsXml()),
    stringEntry('xl/styles.xml', buildStylesXml()),
    stringEntry('xl/worksheets/sheet1.xml', buildWorksheetXml(completeParams)),
  ]);

  const workbookBuffer = new ArrayBuffer(workbookBytes.byteLength);
  new Uint8Array(workbookBuffer).set(workbookBytes);

  return {
    blob: new Blob([workbookBuffer], { type: XLSX_MIME_TYPE }),
    fileName: buildFileName(params.dueDate, params.status, exportedAt),
  };
};
