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

export interface GestorSeleccionadoMessage {
  version: 1;
  type: 'GESTOR_SELECTED';
  popupId: string;
  payload: {
    id: string;
    nombre: string;
  };
}
