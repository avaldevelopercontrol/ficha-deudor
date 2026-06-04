import { apiClient } from '../../../shared/api/apiClient';
import type {
  ApiResponseSimple,
  CabeceraDatosAdicionalesApi,
  DatoAdicionalApi,
  ColumnApi,
} from '../../../shared/types/indexApi';

const BASE_GESTION = '/v1/Gestion';

// Campos estaticos
const CAMPOS_ESTATICOS_DA = [
  'nId_DocxCobrarAd',
  'nId_DocxCobrar',
  'nId_PersDeudor',
  'nId_Cartera',
  'nId_Cliente',
];

// ─── 1. CABECERAS DINAMICAS ───
export async function fetchCabeceraDatosAdicionales(
  id_cliente: string,
  pantalla: number
): Promise<ColumnApi[]> {
  const params = new URLSearchParams({
    nId_Cliente: id_cliente,
    pantalla: String(pantalla),
  });

  const result = await apiClient<ApiResponseSimple<CabeceraDatosAdicionalesApi>>(
    `${BASE_GESTION}/GetCabeceraGestionesAdicionales?${params.toString()}`,
    {
      mock: () => mockCabeceraResponse(id_cliente, pantalla),
    }
  );

  if (result.statusCode !== 200) {
    throw new Error(result.message || 'Error cargando cabeceras');
  }

  return mapCabeceraToColumns(result.response);
}

// ─── 2. TODOS LOS REGISTROS (sin paginacion) ───
export async function fetchAllDatosAdicionales(
  id_cliente: string,
  id_cartera: string,
  id_deudor: string
): Promise<DatoAdicionalApi[]> {
  // Si el backend tiene endpoint sin paginacion, usalo:
  // return apiClient<ApiResponseSimple<DatoAdicionalApi[]>>(...)

  // Por ahora simulamos con paginacion grande:
  const params = new URLSearchParams({
    nId_Cliente: id_cliente,
    nId_Cartera: id_cartera,
    nId_Persdeudor: id_deudor,
    PageNumber: '1',
    PageSize: '1000', // Cargamos todo de una vez
  });

  const result = await apiClient<{
    code: string;
    message: string;
    messageUser: string;
    statusCode: number;
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
    response: DatoAdicionalApi[];
  }>(
    `${BASE_GESTION}/GetGestionesAdicionales?${params.toString()}`,
    {
      mock: () => mockAllDatosAdicionales(id_cliente),
    }
  );

  if (result.statusCode !== 200) {
    throw new Error(result.message || 'Error cargando datos adicionales');
  }

  return result.response;
}

// ═══════════════════════════════════════════
// MAPEO: Cabecera -> ColumnApi[]
// ═══════════════════════════════════════════
function mapCabeceraToColumns(cabecera: CabeceraDatosAdicionalesApi): ColumnApi[] {
  const columns: ColumnApi[] = [];

  for (const [key, value] of Object.entries(cabecera)) {
    if (key === 'idCab') continue;
    const label = String(value);
    const type = inferTypeFromLabel(key, label);
    columns.push({ key, label, type });
  }

  return columns;
}

function inferTypeFromLabel(key: string, label: string): ColumnApi['type'] {
  const lowerKey = key.toLowerCase();
  const lowerLabel = label.toLowerCase();

  if (lowerKey.includes('monto') || lowerKey.includes('importe') || lowerKey.includes('saldo') || lowerKey.includes('deuda')) return 'money';
  if (lowerKey.includes('atraso') || lowerKey.includes('dias')) return 'atraso';
  if (lowerKey.includes('fecha') || lowerKey.includes('vencimiento')) return 'date';
  if (lowerKey === 'estado' || lowerKey.includes('estadoservicio') || lowerKey.includes('estado_')) return 'estado';
  if (lowerLabel.includes('monto') || lowerLabel.includes('importe') || lowerLabel.includes('saldo')) return 'money';

  return 'text';
}

// ═══════════════════════════════════════════
// MOCKS
// ═══════════════════════════════════════════

function mockCabeceraResponse(
  id_cliente: string,
  pantalla: number
): ApiResponseSimple<CabeceraDatosAdicionalesApi> {
  return {
    code: '200',
    message: 'OK',
    messageUser: 'OK',
    statusCode: 200,
    response: {
      idCab: 11,
      recibo: 'Recibo',
      telefono: 'Telefono',
      servicio: 'Servicio',
      estadoServicio: 'Estado de Servicio',
      motivo: 'Motivo',
      codigoCliente: 'Cod.Cliente',
    },
  };
}

function mockAllDatosAdicionales(id_cliente: string): {
  code: string; message: string; messageUser: string; statusCode: number;
  pageNumber: number; pageSize: number; totalRecords: number; totalPages: number;
  response: DatoAdicionalApi[];
} {
  const allData: DatoAdicionalApi[] = [
    { nId_DocxCobrarAd: 35355807, nId_DocxCobrar: 232401077, nId_PersDeudor: 3260000, nId_Cartera: 33982, nId_Cliente: 95, recibo: 'SG0200000004', telefono: '12780039', servicio: 'Telefonia Larga Distancia', estadoServicio: 'Activo', motivo: '', codigoCliente: '' },
    { nId_DocxCobrarAd: 35355808, nId_DocxCobrar: 232401077, nId_PersDeudor: 3260000, nId_Cartera: 33982, nId_Cliente: 95, recibo: 'SG0200000004', telefono: '13300397', servicio: 'Telefonia Larga Distancia', estadoServicio: 'Activo', motivo: '', codigoCliente: '' },
    { nId_DocxCobrarAd: 35355809, nId_DocxCobrar: 232401077, nId_PersDeudor: 3260000, nId_Cartera: 33982, nId_Cliente: 95, recibo: 'SG0200000004', telefono: '13307382', servicio: 'Telefonia Larga Distancia', estadoServicio: 'Activo', motivo: '', codigoCliente: '' },
    { nId_DocxCobrarAd: 35355810, nId_DocxCobrar: 232401077, nId_PersDeudor: 3260000, nId_Cartera: 33982, nId_Cliente: 95, recibo: 'SG0200000004', telefono: '13311634', servicio: 'Telefonia Larga Distancia', estadoServicio: 'Activo', motivo: '', codigoCliente: '' },
    { nId_DocxCobrarAd: 35355811, nId_DocxCobrar: 232401077, nId_PersDeudor: 3260000, nId_Cartera: 33982, nId_Cliente: 95, recibo: 'SG0200000004', telefono: '13325932', servicio: 'Telefonia Larga Distancia', estadoServicio: 'Activo', motivo: '', codigoCliente: '' },
    { nId_DocxCobrarAd: 35355812, nId_DocxCobrar: 232401077, nId_PersDeudor: 3260000, nId_Cartera: 33982, nId_Cliente: 95, recibo: 'SG0200000004', telefono: '13325934', servicio: 'Telefonia Larga Distancia', estadoServicio: 'Activo', motivo: '', codigoCliente: '' },
    { nId_DocxCobrarAd: 35355813, nId_DocxCobrar: 232401077, nId_PersDeudor: 3260000, nId_Cartera: 33982, nId_Cliente: 95, recibo: 'SG0200000004', telefono: '14230741', servicio: 'Telefonia Larga Distancia', estadoServicio: 'Activo', motivo: '', codigoCliente: '' },
    { nId_DocxCobrarAd: 35355814, nId_DocxCobrar: 232401077, nId_PersDeudor: 3260000, nId_Cartera: 33982, nId_Cliente: 95, recibo: 'SG0200000004', telefono: '14235779', servicio: 'Telefonia Larga Distancia', estadoServicio: 'Activo', motivo: '', codigoCliente: '' },
    { nId_DocxCobrarAd: 35355815, nId_DocxCobrar: 232401077, nId_PersDeudor: 3260000, nId_Cartera: 33982, nId_Cliente: 95, recibo: 'SG0200000004', telefono: '14241291', servicio: 'Telefonia Larga Distancia', estadoServicio: 'Activo', motivo: '', codigoCliente: '' },
    { nId_DocxCobrarAd: 35355816, nId_DocxCobrar: 232401077, nId_PersDeudor: 3260000, nId_Cartera: 33982, nId_Cliente: 95, recibo: 'SG0200000004', telefono: '14241744', servicio: 'Telefonia Larga Distancia', estadoServicio: 'Activo', motivo: '', codigoCliente: '' },
  ];

  for (let i = 10; i < 89; i++) {
    allData.push({
      nId_DocxCobrarAd: 35355817 + i, nId_DocxCobrar: 232401077, nId_PersDeudor: 3260000,
      nId_Cartera: 33982, nId_Cliente: 95,
      recibo: `SG02000000${String(i + 1).padStart(2, '0')}`,
      telefono: String(12780039 + i),
      servicio: i % 3 === 0 ? 'Telefonia Local' : 'Telefonia Larga Distancia',
      estadoServicio: i % 7 === 0 ? 'Suspendido' : 'Activo',
      motivo: i % 10 === 0 ? 'Revision pendiente' : '',
      codigoCliente: '',
    });
  }

  return {
    code: '200', message: 'OK', messageUser: 'OK', statusCode: 200,
    pageNumber: 1, pageSize: 1000, totalRecords: allData.length, totalPages: 1,
    response: allData,
  };
}
