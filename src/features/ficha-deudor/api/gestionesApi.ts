import { apiClient } from '../../../shared/api/apiClient';
import type {
  ApiResponse,
  ApiResponseSimple,
  DocumentoApi,
  CabeceraPantallaApi,
  ColumnApi,
  BotonApi,
} from '../../../shared/types/indexApi';

const BASE_GESTION = '/v1/Gestion';
const BASE_DOCUMENTOS = '/documentos';

// Campos estaticos que siempre vienen al inicio del response
const CAMPOS_ESTATICOS = [
  'nId_DocxCobrar',
  'mejorStatus',
  'nId_Moneda',
  'bEstado',
  'nZona',
  'bSelected',
  'nId_Estrategia',
  'nId_Cartera',
];

export async function fetchColumnas(
  id_cliente: string,
  id_contrato: string
): Promise<ColumnApi[]> {
  const params = new URLSearchParams({
    nId_Cliente: id_cliente,
    nId_Contrato: id_contrato,
  });

  const result = await apiClient<ApiResponseSimple<CabeceraPantallaApi[]>>(
    `${BASE_GESTION}/GetCabeceraGestionesAsync?${params.toString()}`,
    {
      mock: () => mockCabecerasResponse(id_cliente, id_contrato),
    }
  );

  if (result.statusCode !== 200) {
    throw new Error(result.message || 'Error cargando cabeceras');
  }

  return mapCabecerasToColumns(result.response);
}

export async function fetchBotones(
  id_cliente: string,
  id_cartera: string
): Promise<BotonApi[]> {
  return apiClient<BotonApi[]>(
    `${BASE_DOCUMENTOS}/botones?id_cliente=${id_cliente}&id_cartera=${id_cartera}`,
    {
      mock: () => mockBotones(id_cliente, id_cartera),
    }
  );
}

export async function fetchGestiones(
  id_cliente: string,
  id_cartera: string,
  id_deudor: string,
  pageNumber: number,
  pageSize: number
): Promise<ApiResponse<DocumentoApi>> {
  const params = new URLSearchParams({
    nId_Cliente: id_cliente,
    nId_Cartera: id_cartera,
    nId_Persdeudor: id_deudor,
    PageNumber: String(pageNumber),
    PageSize: String(pageSize),
  });

  return apiClient<ApiResponse<DocumentoApi>>(
    `${BASE_GESTION}/GetGestionesAsync?${params.toString()}`,
    {
      mock: () => mockGestiones(id_cliente, pageNumber, pageSize),
    }
  );
}

// ═══════════════════════════════════════════
// MAPEO: CabeceraPantallaApi → ColumnApi
// ═══════════════════════════════════════════
function mapCabecerasToColumns(cabeceras: CabeceraPantallaApi[]): ColumnApi[] {
  const ordenadas = [...cabeceras].sort((a, b) => a.orden - b.orden);

  return ordenadas.map((cab, index) => ({
    key: getDynamicFieldKey(index),
    label: cab.tituloCabeceraPantalla,
    type: inferTypeFromCabecera(cab),
  }));
}

function getDynamicFieldKey(index: number): string {
  return `dyn_${index}`;
}

function inferTypeFromCabecera(cab: CabeceraPantallaApi): ColumnApi['type'] {
  const tipoDato = cab.tipoDato.toUpperCase();
  const titulo = cab.tituloCabeceraPantalla.toLowerCase();

  if (tipoDato === 'MONEY') return 'money';
  if (titulo.includes('atraso')) return 'atraso';
  if (titulo.includes('vencimiento') || titulo.includes('fecha')) return 'date';
  if (titulo === 'estado' || titulo.includes('estado_')) return 'estado';
  return 'text';
}

export function mapResponseToDocumento(raw: Record<string, unknown>): DocumentoApi {
  const doc: DocumentoApi = {
    nId_DocxCobrar: Number(raw.nId_DocxCobrar),
    mejorStatus: Number(raw.mejorStatus),
    nId_Moneda: Number(raw.nId_Moneda),
    bEstado: Number(raw.bEstado),
    nZona: String(raw.nZona),
    bSelected: Boolean(raw.bSelected),
    nId_Estrategia: Number(raw.nId_Estrategia),
    nId_Cartera: Number(raw.nId_Cartera),
  };

  // Los campos dinamicos son todos los que NO son estaticos
  const dynamicKeys = Object.keys(raw).filter(
    (key) => !CAMPOS_ESTATICOS.includes(key)
  );

  for (const key of dynamicKeys) {
    doc[key] = raw[key];
  }

  return doc;
}

// ═══════════════════════════════════════════
// MOCKS
// ═══════════════════════════════════════════

function mockCabecerasResponse(
  id_cliente: string,
  id_contrato: string
): ApiResponseSimple<CabeceraPantallaApi[]> {
  return {
    code: '200',
    message: 'OK',
    messageUser: 'OK',
    statusCode: 200,
    response: [
      { idCabeceraPantalla: 134, tituloCabeceraPantalla: 'Id', tipoDato: 'VARCHAR', orden: 1, pantalla: 3, nId_Contrato: Number(id_contrato), nId_Cliente: Number(id_cliente) },
      { idCabeceraPantalla: 135, tituloCabeceraPantalla: 'Documento', tipoDato: 'VARCHAR', orden: 2, pantalla: 3, nId_Contrato: Number(id_contrato), nId_Cliente: Number(id_cliente) },
      { idCabeceraPantalla: 136, tituloCabeceraPantalla: 'Estado', tipoDato: 'VARCHAR', orden: 3, pantalla: 3, nId_Contrato: Number(id_contrato), nId_Cliente: Number(id_cliente) },
      { idCabeceraPantalla: 137, tituloCabeceraPantalla: 'Vencimiento', tipoDato: 'VARCHAR', orden: 4, pantalla: 3, alineacionHtml: 'right', nId_Contrato: Number(id_contrato), nId_Cliente: Number(id_cliente) },
      { idCabeceraPantalla: 138, tituloCabeceraPantalla: 'Mon.', tipoDato: 'VARCHAR', orden: 5, pantalla: 3, nId_Contrato: Number(id_contrato), nId_Cliente: Number(id_cliente) },
      { idCabeceraPantalla: 139, tituloCabeceraPantalla: 'Importe', tipoDato: 'MONEY', operaTotal: false, orden: 6, pantalla: 3, alineacionHtml: 'right', nId_Contrato: Number(id_contrato), nId_Cliente: Number(id_cliente) },
      { idCabeceraPantalla: 140, tituloCabeceraPantalla: 'Deu. Vencida', tipoDato: 'MONEY', operaTotal: true, compromiso: true, orden: 7, pantalla: 3, alineacionHtml: 'right', nId_Contrato: Number(id_contrato), nId_Cliente: Number(id_cliente) },
      { idCabeceraPantalla: 141, tituloCabeceraPantalla: 'Atraso', tipoDato: 'VARCHAR', orden: 8, pantalla: 3, nId_Contrato: Number(id_contrato), nId_Cliente: Number(id_cliente) },
      { idCabeceraPantalla: 671, tituloCabeceraPantalla: 'Serv.', tipoDato: 'VARCHAR', orden: 9, pantalla: 3, nId_Contrato: Number(id_contrato), nId_Cliente: Number(id_cliente) },
      { idCabeceraPantalla: 142, tituloCabeceraPantalla: 'Comentario', tipoDato: 'VARCHAR', orden: 10, pantalla: 3, alineacionHtml: 'left', nId_Contrato: Number(id_contrato), nId_Cliente: Number(id_cliente) },
      { idCabeceraPantalla: 549, tituloCabeceraPantalla: 'Codigo_Cliente', tipoDato: 'VARCHAR', orden: 11, pantalla: 3, nId_Contrato: Number(id_contrato), nId_Cliente: Number(id_cliente) },
      { idCabeceraPantalla: 292, tituloCabeceraPantalla: 'Estado_Documento', tipoDato: 'VARCHAR', orden: 12, pantalla: 3, nId_Contrato: Number(id_contrato), nId_Cliente: Number(id_cliente) },
      { idCabeceraPantalla: 1924, tituloCabeceraPantalla: 'Fecha Estado Documento', tipoDato: 'VARCHAR', orden: 13, pantalla: 3, nId_Contrato: Number(id_contrato), nId_Cliente: Number(id_cliente) },
      { idCabeceraPantalla: 143, tituloCabeceraPantalla: 'Estado Pago', tipoDato: 'VARCHAR', orden: 14, pantalla: 3, nId_Contrato: Number(id_contrato), nId_Cliente: Number(id_cliente) },
      { idCabeceraPantalla: 223, tituloCabeceraPantalla: 'Status Doc.', tipoDato: 'VARCHAR', orden: 15, pantalla: 3, nId_Contrato: Number(id_contrato), nId_Cliente: Number(id_cliente) },
      { idCabeceraPantalla: 144, tituloCabeceraPantalla: 'Gestor Call', tipoDato: 'VARCHAR', orden: 16, pantalla: 3, nId_Contrato: Number(id_contrato), nId_Cliente: Number(id_cliente) },
      { idCabeceraPantalla: 1907, tituloCabeceraPantalla: 'BAJAPROV', tipoDato: 'VARCHAR', orden: 17, pantalla: 3, nId_Contrato: Number(id_contrato), nId_Cliente: Number(id_cliente) },
    ],
  };
}

function mockBotones(id_cliente: string, id_cartera: string): BotonApi[] {
  if (id_cliente === '178') {
    return [
      { id: 'estado_cuenta', label: 'ESTADO_CUENTA', action: 'modal_estado_cuenta' },
      { id: 'datos_cliente', label: 'DATOS_CLIENTE', action: 'modal_datos_cliente' },
      { id: 'cartas', label: 'CARTAS', action: 'modal_cartas' },
      { id: 'pagos', label: 'PAGOS', action: 'modal_pagos' },
      { id: 'email', label: 'EMAIL', action: 'modal_email' },
    ];
  }
  return [
    { id: 'estado_cuenta', label: 'ESTADO_CUENTA', action: 'modal_estado_cuenta' },
    { id: 'pagos', label: 'PAGOS', action: 'modal_pagos' },
  ];
}

function mockGestiones(
  id_cliente: string,
  pageNumber: number,
  pageSize: number
): ApiResponse<DocumentoApi> {
  const rawData: Record<string, unknown>[] = [
    {
      nId_DocxCobrar: 232395238, mejorStatus: 0, nId_Moneda: 1, bEstado: 1, nZona: '1',
      bSelected: false, nId_Estrategia: 0, nId_Cartera: 33982, nro: 1,
      numeroDocumento: '005016431465', estado: 'ACTIVO', fechaVencimiento: '31 Jan 2021',
      siglaMoneda: 'S/', importeTotal: 8065.2, importeSaldo: 8065.2, diasAtrazo: 1947,
      servicio: 'SGA', comentario: '', codigoCliente: '00024279',
      estadoDocumento: '', fechaEstadoDocumento: '', statusDocumento: '', fechaStatusDocumento: '',
      gestorCall: '16057 - 16057', bajaProvabilidad: '',
    },
    {
      nId_DocxCobrar: 232395575, mejorStatus: 0, nId_Moneda: 1, bEstado: 1, nZona: '1',
      bSelected: false, nId_Estrategia: 0, nId_Cartera: 33982, nro: 2,
      numeroDocumento: '005016359411', estado: 'ACTIVO', fechaVencimiento: '31 Jan 2021',
      siglaMoneda: 'S/', importeTotal: 3153.88, importeSaldo: 3153.88, diasAtrazo: 1947,
      servicio: 'SGA', comentario: '', codigoCliente: '00024279',
      estadoDocumento: '', fechaEstadoDocumento: '', statusDocumento: '', fechaStatusDocumento: '',
      gestorCall: '16057 - 16057', bajaProvabilidad: '',
    },
    {
      nId_DocxCobrar: 232397484, mejorStatus: 0, nId_Moneda: 1, bEstado: 1, nZona: '1',
      bSelected: false, nId_Estrategia: 0, nId_Cartera: 33982, nro: 3,
      numeroDocumento: 'T001-0844781115', estado: 'ACTIVO', fechaVencimiento: '06 Oct 2020',
      siglaMoneda: 'S/', importeTotal: 14.58, importeSaldo: 14.58, diasAtrazo: 2064,
      servicio: 'BSCS', comentario: '', codigoCliente: '36367777',
      estadoDocumento: '', fechaEstadoDocumento: '', statusDocumento: '', fechaStatusDocumento: '',
      gestorCall: '16057 - 16057', bajaProvabilidad: '',
    },
    {
      nId_DocxCobrar: 232397866, mejorStatus: 0, nId_Moneda: 1, bEstado: 1, nZona: '1',
      bSelected: false, nId_Estrategia: 0, nId_Cartera: 33982, nro: 4,
      numeroDocumento: 'SB01-0609161515', estado: 'ACTIVO', fechaVencimiento: '30 Mar 2026',
      siglaMoneda: 'S/', importeTotal: 252.93, importeSaldo: 252.93, diasAtrazo: 63,
      servicio: 'BSCS', comentario: '', codigoCliente: '53430697',
      estadoDocumento: '', fechaEstadoDocumento: '', statusDocumento: '', fechaStatusDocumento: '',
      gestorCall: '16057 - 16057', bajaProvabilidad: '',
    },
    {
      nId_DocxCobrar: 232398079, mejorStatus: 0, nId_Moneda: 1, bEstado: 0, nZona: '1',
      bSelected: false, nId_Estrategia: 0, nId_Cartera: 33982, nro: 5,
      numeroDocumento: 'SS0101828305', estado: 'INACTIVO', fechaVencimiento: '12 May 2026',
      siglaMoneda: 'S/', importeTotal: 2595.41, importeSaldo: 0, diasAtrazo: 9,
      servicio: 'SGA', comentario: '', codigoCliente: '00024279',
      estadoDocumento: '', fechaEstadoDocumento: '', statusDocumento: 'Trans.', fechaStatusDocumento: '',
      gestorCall: '16057 - 16057', bajaProvabilidad: '',
    },
    {
      nId_DocxCobrar: 232398168, mejorStatus: 0, nId_Moneda: 1, bEstado: 1, nZona: '1',
      bSelected: false, nId_Estrategia: 0, nId_Cartera: 33982, nro: 6,
      numeroDocumento: '005009549792', estado: 'ACTIVO', fechaVencimiento: '31 Jan 2021',
      siglaMoneda: 'S/', importeTotal: 6132.93, importeSaldo: 6132.93, diasAtrazo: 1947,
      servicio: 'SGA', comentario: '', codigoCliente: '00024279',
      estadoDocumento: '', fechaEstadoDocumento: '', statusDocumento: '', fechaStatusDocumento: '',
      gestorCall: '16057 - 16057', bajaProvabilidad: '',
    },
    {
      nId_DocxCobrar: 232398469, mejorStatus: 0, nId_Moneda: 1, bEstado: 1, nZona: '1',
      bSelected: false, nId_Estrategia: 0, nId_Cartera: 33982, nro: 7,
      numeroDocumento: 'SS0100108733', estado: 'ACTIVO', fechaVencimiento: '31 Jan 2021',
      siglaMoneda: 'S/', importeTotal: 3513.79, importeSaldo: 3513.79, diasAtrazo: 1947,
      servicio: 'SGA', comentario: '', codigoCliente: '00024279',
      estadoDocumento: '', fechaEstadoDocumento: '', statusDocumento: '', fechaStatusDocumento: '',
      gestorCall: '16057 - 16057', bajaProvabilidad: '',
    },
    {
      nId_DocxCobrar: 232398536, mejorStatus: 0, nId_Moneda: 1, bEstado: 1, nZona: '1',
      bSelected: false, nId_Estrategia: 0, nId_Cartera: 33982, nro: 8,
      numeroDocumento: '005013584752', estado: 'ACTIVO', fechaVencimiento: '31 Jan 2021',
      siglaMoneda: 'S/', importeTotal: 250.82, importeSaldo: 250.82, diasAtrazo: 1947,
      servicio: 'SGA', comentario: '', codigoCliente: '00024279',
      estadoDocumento: '', fechaEstadoDocumento: '', statusDocumento: '', fechaStatusDocumento: '',
      gestorCall: '16057 - 16057', bajaProvabilidad: '',
    },
    {
      nId_DocxCobrar: 232399902, mejorStatus: 0, nId_Moneda: 1, bEstado: 1, nZona: '1',
      bSelected: false, nId_Estrategia: 0, nId_Cartera: 33982, nro: 9,
      numeroDocumento: '005017269846', estado: 'ACTIVO', fechaVencimiento: '31 Jan 2021',
      siglaMoneda: 'S/', importeTotal: 8.18, importeSaldo: 8.18, diasAtrazo: 1947,
      servicio: 'SGA', comentario: '', codigoCliente: '00024279',
      estadoDocumento: '', fechaEstadoDocumento: '', statusDocumento: '', fechaStatusDocumento: '',
      gestorCall: '16057 - 16057', bajaProvabilidad: '',
    },
    {
      nId_DocxCobrar: 232400216, mejorStatus: 0, nId_Moneda: 1, bEstado: 1, nZona: '1',
      bSelected: false, nId_Estrategia: 0, nId_Cartera: 33982, nro: 10,
      numeroDocumento: '005017560307', estado: 'ACTIVO', fechaVencimiento: '31 Jan 2021',
      siglaMoneda: 'S/', importeTotal: 19.82, importeSaldo: 19.82, diasAtrazo: 1947,
      servicio: 'SGA', comentario: '', codigoCliente: '00024279',
      estadoDocumento: '', fechaEstadoDocumento: '', statusDocumento: '', fechaStatusDocumento: '',
      gestorCall: '16057 - 16057', bajaProvabilidad: '',
    },
  ];

  for (let i = 10; i < 44; i++) {
    rawData.push({
      nId_DocxCobrar: 232400217 + i, mejorStatus: 0, nId_Moneda: 1, bEstado: 1, nZona: '1',
      bSelected: false, nId_Estrategia: 0, nId_Cartera: 33982, nro: i + 1,
      numeroDocumento: `DOC-${String(i + 1).padStart(6, '0')}`,
      estado: i % 5 === 0 ? 'INACTIVO' : 'ACTIVO', fechaVencimiento: '31 Jan 2021',
      siglaMoneda: 'S/', importeTotal: 100 + i * 10, importeSaldo: 80 + i * 8, diasAtrazo: 1947 - i,
      servicio: 'SGA', comentario: '', codigoCliente: '00024279',
      estadoDocumento: '', fechaEstadoDocumento: '', statusDocumento: '', fechaStatusDocumento: '',
      gestorCall: '16057 - 16057', bajaProvabilidad: '',
    });
  }

  const totalRecords = rawData.length;
  const totalPages = Math.ceil(totalRecords / pageSize);
  const start = (pageNumber - 1) * pageSize;
  const paginatedRaw = rawData.slice(start, start + pageSize);

  return {
    code: '200', message: 'OK', messageUser: 'OK', statusCode: 200,
    pageNumber, pageSize, totalRecords, totalPages,
    response: paginatedRaw.map(mapResponseToDocumento),
  };
}