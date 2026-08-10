import type { ApiResponse } from '@shared/types/indexApi';

export interface ProduccionGestorHoyApi {
  hora: string;
  total: number;
  ges4: number;
  ges15: number;
  ges13: number;
  ges4b: number;
  ges0: number;
}

export interface ProduccionGestorHoyRow {
  hora: string;
  totalGestionesTelefonicas: number;
  contactos: number;
  busquedas: number;
  sms: number;
  noContactos: number;
  otros: number;
}

export type GetProduccionGestorHoyResponse = ApiResponse<
  | ProduccionGestorHoyApi[]
  | ProduccionGestorHoyApi
  | null
>;
