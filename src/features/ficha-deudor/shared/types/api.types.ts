// ═══════════════════════════════════════════
// GESTIONES (Documentos)
// ═══════════════════════════════════════════

export interface CabeceraPantallaApi {
  tituloCabeceraPantalla: string;
  tipoDato: string;
  orden: number;
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
  idCab?: number | null;
  [campo: string]: unknown;
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
  popupUrl?: string;
}
