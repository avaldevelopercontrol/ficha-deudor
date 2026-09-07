import type {
  ProduccionGestorHoyRow,
} from '../types/produccionGestorHoy.types';
import {
  parseProduccionGestorHoyResponse,
} from '../validations/produccionGestorHoyApi.validators';

const toNumber = (
  value: unknown
): number => {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : 0;
};

export const mapProduccionGestorHoyResponse = (
  response: unknown
): ProduccionGestorHoyRow[] => {
  return parseProduccionGestorHoyResponse(
    response,
    'No se pudo cargar la producción del gestor por horas.'
  ).map((item) => ({
    hora: String(
      item.hora ?? ''
    ).trim(),

    totalGestionesTelefonicas:
      toNumber(item.total),

    contactos:
      toNumber(item.ges4),

    busquedas:
      toNumber(item.ges15),

    sms:
      toNumber(item.ges13),

    noContactos:
      toNumber(item.ges4b),

    otros:
      toNumber(item.ges0),
  }));
};