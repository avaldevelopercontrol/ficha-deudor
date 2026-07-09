import type {
  GestionCompleta,
  GestionHistoricaApi,
  GestionRealizada,
  GestionRealizadaApi,
} from '../../../shared/types';

export const mapGestionRealizada = (
  item: GestionRealizadaApi
): GestionRealizada => ({
  id: String(item.nId_DocxCobrarOpe),
  nro: item.nro,
  fecha: item.fechaGestion,
  gestor: item.gestor,
  documento: item.documento,
  operacion: item.operacion,
  respuesta: item.respuesta,
  comentario: item.comentario,
});

export const mapGestionesRealizadas = (
  data: GestionRealizadaApi[] | null | undefined
): GestionRealizada[] => {
  return (data ?? []).map(mapGestionRealizada);
};

export const mapGestionHistorica = (
  item: GestionHistoricaApi
): GestionCompleta => ({
  id: String(item.nId_DocxCobrarOpe),
  nro: item.nro,
  cliente: item.cliente,
  cartera: item.cartera,
  campana: item.campanna,
  fecha: item.fecha,
  gestor: item.gestor,
  documento: item.documento,
  operacion: item.operacion,
  resultado: item.resultado,
  comentario: item.comentario,
});

export const mapGestionesHistoricas = (
  data: GestionHistoricaApi[] | null | undefined
): GestionCompleta[] => {
  return (data ?? []).map(mapGestionHistorica);
};