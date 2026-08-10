export interface EstadoGestionApi {
  nId_DocxCobrarOpe: number;
  nro: number;
  fechaGestion: string;
  operador: string;
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

export interface EstadoGestionHistoricaApi {
  nId_DocxCobrarOpe: number;
  nro: number;
  cliente: string;
  cartera: string;
  campanna: string;
  fecha: string;
  gestor: string;
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
