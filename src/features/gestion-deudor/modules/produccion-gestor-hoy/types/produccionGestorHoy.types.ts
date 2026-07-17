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

export interface GetProduccionGestorHoyResponse {
  code: string;
  message: string;
  messageUser: string;
  statusCode: number;
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  response:
    | ProduccionGestorHoyApi[]
    | ProduccionGestorHoyApi
    | null;
}