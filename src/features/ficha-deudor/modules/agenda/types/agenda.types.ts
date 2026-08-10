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
