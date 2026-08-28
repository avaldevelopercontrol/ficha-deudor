import {
  createObjectGuard,
  isInteger,
  isString,
} from '../../../shared/utils/runtimeTypeGuards.utils';
import type {
  GestionHistoricaApi,
  GestionRealizadaApi,
} from '../types/gestionRealizada.types';

export const isGestionRealizadaApi =
  createObjectGuard<GestionRealizadaApi>({
    nId_DocxCobrarOpe: isInteger,
    nro: isInteger,
    fechaGestion: isString,
    gestor: isString,
    documento: isString,
    operacion: isString,
    respuesta: isString,
    comentario: isString,
  });

export const isGestionHistoricaApi =
  createObjectGuard<GestionHistoricaApi>({
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
