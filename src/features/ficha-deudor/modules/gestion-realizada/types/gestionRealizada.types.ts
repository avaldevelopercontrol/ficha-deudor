export interface GestionRealizadaApi {
  nId_DocxCobrarOpe: number;
  nro: number;
  fechaGestion: string;
  gestor: string;
  documento: string;
  operacion: string;
  respuesta: string;
  comentario: string;
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

export interface GestionHistoricaApi {
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
