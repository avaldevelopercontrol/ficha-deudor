import {
  createInvalidGestionDeudorApiResponseError,
  parseGestionDeudorApiRecordCollection,
} from '../api/gestionDeudorApiBoundary';
import type {
  DeudorGestionDeudorApi,
} from '../api/deudoresGestionDeudorApi.types';

const REQUIRED_DEUDOR_FIELDS = [
  'nId_PersDeudor',
  'nro',
  'zonaCampanna',
  'nId_Cliente',
  'nId_Contrato',
  'nId_Cartera',
  'cartera',
  'codigoCliente',
  'deudor',
  'importe',
  'saldo',
  'fechaUltimaGestionCALL',
  'ultimaGestionCALL',
  'cantidadGestionCALL',
  'fechaUltimaGestionCAMPO',
  'ultimaGestionCAMPO',
  'cantidadGestionCAMPO',
  'fechaPromesa',
  'mejorStatus',
] as const satisfies readonly (keyof DeudorGestionDeudorApi)[];

const hasOwn = (
  value: Record<string, unknown>,
  property: string
): boolean => {
  return Object.prototype.hasOwnProperty.call(
    value,
    property
  );
};

const parseDeudorRecord = (
  value: Record<string, unknown>,
  fallbackMessage: string
): DeudorGestionDeudorApi => {
  if (
    !REQUIRED_DEUDOR_FIELDS.every((field) =>
      hasOwn(value, field)
    )
  ) {
    throw createInvalidGestionDeudorApiResponseError(
      fallbackMessage
    );
  }

  return {
    nId_PersDeudor: value.nId_PersDeudor,
    nro: value.nro,
    zonaCampanna: value.zonaCampanna,
    nId_Cliente: value.nId_Cliente,
    nId_Contrato: value.nId_Contrato,
    nId_Cartera: value.nId_Cartera,
    cartera: value.cartera,
    codigoCliente: value.codigoCliente,
    deudor: value.deudor,
    importe: value.importe,
    saldo: value.saldo,
    fechaUltimaGestionCALL:
      value.fechaUltimaGestionCALL,
    ultimaGestionCALL: value.ultimaGestionCALL,
    cantidadGestionCALL:
      value.cantidadGestionCALL,
    fechaUltimaGestionCAMPO:
      value.fechaUltimaGestionCAMPO,
    ultimaGestionCAMPO:
      value.ultimaGestionCAMPO,
    cantidadGestionCAMPO:
      value.cantidadGestionCAMPO,
    fechaPromesa: value.fechaPromesa,
    mejorStatus: value.mejorStatus,
  };
};

export const parseDeudoresGestionDeudorResponse = (
  response: unknown,
  fallbackMessage: string
): DeudorGestionDeudorApi[] => {
  return parseGestionDeudorApiRecordCollection(
    response,
    fallbackMessage
  ).map((item) =>
    parseDeudorRecord(item, fallbackMessage)
  );
};
