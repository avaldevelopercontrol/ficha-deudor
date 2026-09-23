export type WorksheetCell =
  | { kind: 'string'; value: string; style?: number }
  | { kind: 'number'; value: number; style?: number }
  | { kind: 'date'; value: string | null; style?: number };

export const XML_HEADER =
  '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';

const escapeXml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');

export const columnNameFromIndex = (index: number): string => {
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

export const buildRowXml = (
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

export const padWorksheetRow = (
  values: readonly WorksheetCell[],
  totalColumns: number
): WorksheetCell[] => {
  const result = [...values];

  while (result.length < totalColumns) {
    result.push({ kind: 'string', value: '' });
  }

  return result;
};

export const buildMetadataRow = (
  pairs: ReadonlyArray<readonly [string, WorksheetCell]>,
  totalColumns: number
): WorksheetCell[] => {
  const row: WorksheetCell[] = [];

  pairs.forEach(([label, value], pairIndex) => {
    if (pairIndex > 0) {
      row.push({ kind: 'string', value: '' });
    }

    row.push({ kind: 'string', value: label, style: 3 });
    row.push({ ...value, style: value.style ?? 4 });
  });

  return padWorksheetRow(row, totalColumns);
};
