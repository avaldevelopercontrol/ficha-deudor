// src/types/indexApix.ts

// ─── Respuesta paginada ───
export interface ApiResponse<T> {
  code: string;
  message: string;
  messageUser: string;
  statusCode: number;
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  response: T[];
}

// ─── Respuesta simple (cabeceras) ───
export interface ApiResponseSimple<T> {
  code: string;
  message: string;
  messageUser: string;
  statusCode: number;
  response: T;
}

// ═══════════════════════════════════════════
// GESTIONES (Documentos)
// ═══════════════════════════════════════════

export interface CabeceraPantallaApi {
  idCabeceraPantalla: number;
  tituloCabeceraPantalla: string;
  tipoDato: string;
  operaTotal?: boolean;
  compromiso?: boolean;
  orden: number;
  pantalla: number;
  alineacionHtml?: string;
  nId_Contrato: number;
  nId_Cliente: number;
}

export interface DocumentoApi {
  nId_DocxCobrar: number;
  mejorStatus: number;
  nId_Moneda: number;
  bEstado: number;
  nZona: string;
  bSelected: boolean;
  nId_Estrategia: number;
  nId_Cartera: number;
  [key: string]: unknown;
}

// ═══════════════════════════════════════════
// DATOS ADICIONALES
// ═══════════════════════════════════════════

/** Cabecera de Datos Adicionales: objeto plano donde key = campo, value = label */
export interface CabeceraDatosAdicionalesApi {
  idCab: number;
  [campo: string]: string | number;
}

/** Registro de Datos Adicionales: campos estaticos + dinamicos */
export interface DatoAdicionalApi {
  nId_DocxCobrarAd: number;
  nId_DocxCobrar: number;
  nId_PersDeudor: number;
  nId_Cartera: number;
  nId_Cliente: number;
  [campo: string]: unknown;
}

// ═══════════════════════════════════════════
// COLUMNAS NORMALIZADAS (compartido)
// ═══════════════════════════════════════════

export interface ColumnApi {
  key: string;
  label: string;
  type: 'text' | 'money' | 'date' | 'atraso' | 'estado';
}

// ─── Boton ───
export interface BotonApi {
  id: string;
  label: string;
  action?: string;
}

// ─── Estado unificado ───
export interface TableDataState {
  columns: ColumnApi[];
  data: unknown[];
  botones: BotonApi[];
  isLoading: boolean;
  error: string | null;
}
