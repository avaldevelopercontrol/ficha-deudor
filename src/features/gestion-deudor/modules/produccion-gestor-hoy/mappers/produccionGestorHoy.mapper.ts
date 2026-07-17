import type {
  GetProduccionGestorHoyResponse,
  ProduccionGestorHoyApi,
  ProduccionGestorHoyRow,
} from '../types/produccionGestorHoy.types';

const toNumber = (
  value: unknown
): number => {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : 0;
};

const normalizeResponse = (
  response:
    GetProduccionGestorHoyResponse['response']
): ProduccionGestorHoyApi[] => {
  if (Array.isArray(response)) {
    return response;
  }

  return response ? [response] : [];
};

export const mapProduccionGestorHoyResponse = (
  result: GetProduccionGestorHoyResponse
): ProduccionGestorHoyRow[] => {
  return normalizeResponse(
    result.response
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