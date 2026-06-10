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
  response: T;
}

// ─── Respuesta simple (cabeceras) ───
export interface ApiResponseSimple<T> {
  code: string;
  message: string;
  messageUser: string;
  statusCode: number;
  response: T;
}

export * from '../../features/ficha-deudor/types/api.types';
export * from '../../features/ficha-deudor/types/telefono.types';
export * from '../../features/ficha-deudor/types/direccion.types';
export * from '../../features/ficha-deudor/types/gestion.types';
export * from '../../features/ficha-deudor/types/deudor.types';