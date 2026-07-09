export interface AgendaApi {
  nid_agenda: number;
  fechaNuevaGestion: string;
  tiempoVencido: string;
  cartera: string;
  deudor: string;
  respuestaOEstado: string;
  usuario: string;
}

export interface Agenda {
  id: string;
  fechaNuevaGestion: string;
  tiempoVencido: string;
  cartera: string;
  deudor: string;
  respuestaOEstado: string;
  usuario: string;
}

export interface AgendaListResponse {
  code: string;
  message: string;
  messageUser: string;
  statusCode: number;
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  response: AgendaApi[];
}