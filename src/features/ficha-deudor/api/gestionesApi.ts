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
const BASE_DOCUMENTOS = '/v1/documentos';

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

// ─── 1. CABECERAS ───
export async function fetchColumnas(
  id_cliente: string,
  id_contrato: string
): Promise<ColumnApi[]> {
  const params = new URLSearchParams({
    nId_Cliente: id_cliente,
    nId_Contrato: id_contrato,
  });

  const result = await apiClient<ApiResponseSimple<CabeceraPantallaApi[]>>(
    `${BASE_GESTION}/GetGestionDocumentosCabecera?${params.toString()}`
  );

  if (result.statusCode !== 200) {
    throw new Error(result.message || 'Error cargando cabeceras');
  }

  return mapCabecerasToColumns(result.response);
}

// ─── 2. BOTONES (mock) ───
export async function fetchBotones(
  id_cliente: string,
  id_cartera: string,
  id_deudor: string,
  id_usuario: string
): Promise<BotonApi[]> {
  return apiClient<BotonApi[]>(
    `${BASE_DOCUMENTOS}/botones?id_cliente=${id_cliente}`,
    {
      mock: () => mockBotones(id_cliente, id_cartera, id_deudor, id_usuario),
    }
  );
}

// ─── 3. TODOS LOS REGISTROS (sin paginación server-side) ───
// NUEVO: Trae todo de una vez para filtros client-side
export async function fetchAllGestiones(
  id_cliente: string,
  id_cartera: string,
  id_deudor: string
): Promise<DocumentoApi[]> {
  const params = new URLSearchParams({
    nId_Cliente: id_cliente,
    nId_Cartera: id_cartera,
    nId_Persdeudor: id_deudor,
    PageNumber: '1',
    PageSize: '2000', // Cargamos todo de una vez
  });

  const result = await apiClient<ApiResponse<DocumentoApi[]>>(
    `${BASE_GESTION}/GetGestionDocumentos?${params.toString()}`
  );

  if (result.statusCode !== 200) {
    throw new Error(result.message || 'Error cargando documentos');
  }

  // Si el backend devuelve array plano, usalo directo
  // Si devuelve ApiResponse con response[], mapeamos
  return Array.isArray(result.response) ? result.response : [];
}

// ─── 4. PAGINACIÓN SERVER-SIDE (mantenido por si lo necesitas luego) ───
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
    `${BASE_GESTION}/GetGestionDocumentos?${params.toString()}`
  );
}

// ═══════════════════════════════════════════
// MAPEO
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
function mockBotones(id_cliente: string, id_cartera: string, id_deudor: string, id_usuario:string): BotonApi[] {
  if (id_cliente === '95') {
    return [
      //{ id: 'datos_cliente', label: 'DATOS_CLIENTE', action: 'modal_datos_cliente' },
      {
        id: 'pagos',
        label: 'PAGOS',
        action: 'popup_pago',
        popupUrl: `${window.location.origin}/popup/pago-deudor/${id_cliente}/${id_cartera}/${id_deudor}`,
      },
      {
        id: 'email',
        label: 'EMAIL',
        action: 'popup_email',
        popupUrl: `${window.location.origin}/popup/email-deudor/${id_cliente}/${id_deudor}/${id_usuario}`,
      },
      {
        id: 'agendas',
        label: 'AGENDAS',
        action: 'popup_agenda',
        popupUrl: `${window.location.origin}/popup/agenda-deudor/${id_cliente}/${id_cartera}/${id_deudor}/${id_usuario}`,
      },
      {
        id: 'inf_deudor',
        label: 'INF. DEUDOR',
        action: 'popup_inf_deudor',
        popupUrl: `${window.location.origin}/popup/inf-deudor/${id_cliente}/${id_cartera}/${id_deudor}/${id_usuario}`,
      },
    ];
  }
  return [
    { id: 'estado_cuenta', label: 'ESTADO_CUENTA', action: 'modal_estado_cuenta' },
    { id: 'pagos', label: 'PAGOS', action: 'modal_pagos' },
  ];
}