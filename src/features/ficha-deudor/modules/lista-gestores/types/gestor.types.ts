export interface GestorApi {
  id: number;
  nombre: string;
  perfil: string;
  login: string;
  subZona: string;
  codRecaudacion: string;
}

export interface Gestor {
  id: string;
  nombre: string;
  perfil: string;
  login: string;
  subZona: string;
  codRecaudacion: string;
}

export interface GestoresApiResponse {
  code: string;
  message: string;
  messageUser: string;
  statusCode: number;
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  response: GestorApi[];
}

export interface GestorSeleccionadoMessage {
  type: 'GESTOR_SELECTED';
  payload: {
    id: string;
    nombre: string;
  };
}