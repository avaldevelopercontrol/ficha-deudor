import type {
  EstadoGestion,
  EstadoGestionApi,
  EstadoGestionCompleta,
  GestionHistoricaApi,
} from '../../../shared/types';

export const mapEstadoGestion = (
  item: EstadoGestionApi
): EstadoGestion => {
  return {
    id: String(item.nId_DocxCobrarOpe),
    nro: item.nro,
    fecha: item.fechaGestion,
    operador: item.operador,
    documento: item.documento,
    operacion: item.operacion,
    resultado: item.resultado,
    comentario: item.comentario,
  };
};

export const mapEstadosGestion = (
  data: EstadoGestionApi[]
): EstadoGestion[] => {
  return data.map(mapEstadoGestion);
};

export const mapEstadoGestionHistorico = (
  item: GestionHistoricaApi
): EstadoGestionCompleta => {
  return {
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
  };
};

export const mapEstadosGestionHistoricos = (
  data: GestionHistoricaApi[]
): EstadoGestionCompleta[] => {
  return data.map(mapEstadoGestionHistorico);
};