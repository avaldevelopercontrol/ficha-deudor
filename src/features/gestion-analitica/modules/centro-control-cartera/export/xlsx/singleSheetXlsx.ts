import {
  createStoredZip,
  createStoredZipTextEntry,
} from './storedZip';

export const XLSX_MIME_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const XML_HEADER = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';

interface SingleSheetXlsxParams {
  sheetName: string;
  worksheetXml: string;
  stylesXml: string;
  documentTitle: string;
  creator: string;
  exportedAt: Date;
}

const buildWorkbookXml = (sheetName: string): string => `${XML_HEADER}
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <bookViews><workbookView xWindow="0" yWindow="0" windowWidth="24000" windowHeight="12000"/></bookViews>
  <sheets><sheet name="${sheetName}" sheetId="1" r:id="rId1"/></sheets>
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

const buildCorePropertiesXml = ({
  documentTitle,
  creator,
  exportedAt,
}: Pick<
  SingleSheetXlsxParams,
  'documentTitle' | 'creator' | 'exportedAt'
>): string => {
  const createdAt = exportedAt.toISOString();

  return `${XML_HEADER}
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${documentTitle}</dc:title>
  <dc:creator>${creator}</dc:creator>
  <cp:lastModifiedBy>${creator}</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${createdAt}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${createdAt}</dcterms:modified>
</cp:coreProperties>`;
};

const buildAppPropertiesXml = ({
  creator,
  sheetName,
}: Pick<SingleSheetXlsxParams, 'creator' | 'sheetName'>): string => `${XML_HEADER}
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>${creator}</Application>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
  <HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Hojas de cálculo</vt:lpstr></vt:variant><vt:variant><vt:i4>1</vt:i4></vt:variant></vt:vector></HeadingPairs>
  <TitlesOfParts><vt:vector size="1" baseType="lpstr"><vt:lpstr>${sheetName}</vt:lpstr></vt:vector></TitlesOfParts>
</Properties>`;

export const buildSingleSheetXlsxBlob = (
  params: SingleSheetXlsxParams
): Blob => {
  const workbookBytes = createStoredZip([
    createStoredZipTextEntry('[Content_Types].xml', buildContentTypesXml()),
    createStoredZipTextEntry('_rels/.rels', buildRootRelationshipsXml()),
    createStoredZipTextEntry(
      'docProps/core.xml',
      buildCorePropertiesXml(params)
    ),
    createStoredZipTextEntry(
      'docProps/app.xml',
      buildAppPropertiesXml(params)
    ),
    createStoredZipTextEntry(
      'xl/workbook.xml',
      buildWorkbookXml(params.sheetName)
    ),
    createStoredZipTextEntry(
      'xl/_rels/workbook.xml.rels',
      buildWorkbookRelationshipsXml()
    ),
    createStoredZipTextEntry('xl/styles.xml', params.stylesXml),
    createStoredZipTextEntry(
      'xl/worksheets/sheet1.xml',
      params.worksheetXml
    ),
  ]);

  const workbookBuffer = new ArrayBuffer(workbookBytes.byteLength);
  new Uint8Array(workbookBuffer).set(workbookBytes);

  return new Blob([workbookBuffer], { type: XLSX_MIME_TYPE });
};
