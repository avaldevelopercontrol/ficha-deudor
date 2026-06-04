export interface GestionForm {
  nombreContacto: string;
  cargo: string;
  np0: string;
  np1: string;
  np2: string;
  estadoGestion: string;
  telefono: string;
  tipoGestion: string;
  gestorId: string;
  gestorNombre: string;
  fechaCompromisoPago: string;
  compromisoSoles: string;        // Añadido - compromiso en soles
  compromisoUSD: string;          // Añadido - compromiso en dólares
  fechaNuevaGestion: string;      // Fecha para nueva gestión (agendar)
  horaNuevaGestion: string;       // Hora para nueva gestión (agendar)
  fechaGestion: string;           // Fecha de gestión resultante
  horaGestion: string;            // Hora de gestión resultante
  gestionTerminada: boolean;
  observaciones: string;
}

export interface GestionRealizada {
  id: string;
  nro: number;
  fecha: string;
  gestor: string;
  documento: string;
  operacion: string;
  respuesta: string;
  comentario: string;
}

export interface GestionCompleta {
  id: string;
  nro: number;
  cliente: string;
  cartera: string;
  campana: string;
  fecha: string;
  gestor: string;
  documento: string;
  operacion: string;
  resultado: string;
  comentario: string;
}

export interface EstadoGestion {
  id: string;
  nro: number;
  fecha: string;
  operador: string;
  documento: string;
  operacion: string;
  resultado: string;
  comentario: string;
}

export interface EstadoGestionCompleta {
  id: string;
  nro: number;
  cliente: string;
  cartera: string;
  campana: string;
  fecha: string;
  gestor: string;  
  documento: string;
  operacion: string;
  resultado: string;
  comentario: string;
}