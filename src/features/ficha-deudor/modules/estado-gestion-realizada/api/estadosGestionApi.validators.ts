import {
  createObjectGuard,
  isInteger,
  isString,
} from '../../../shared/utils/runtimeTypeGuards.utils';
import type {
  EstadoGestionApi,
  EstadoGestionHistoricaApi,
} from '../types/estadoGestion.types';

export const isEstadoGestionApi = createObjectGuard<EstadoGestionApi>({
  nId_DocxCobrarOpe: isInteger,
  nro: isInteger,
  fechaGestion: isString,
  operador: isString,
  documento: isString,
  operacion: isString,
  resultado: isString,
  comentario: isString,
});

export const isEstadoGestionHistoricaApi =
  createObjectGuard<EstadoGestionHistoricaApi>({
    nId_DocxCobrarOpe: isInteger,
    nro: isInteger,
    cliente: isString,
    cartera: isString,
    campanna: isString,
    fecha: isString,
    gestor: isString,
    documento: isString,
    operacion: isString,
    resultado: isString,
    comentario: isString,
  });
