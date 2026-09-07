import {
  toOptionalIdOrZero,
  toRequiredId,
} from '@shared/utils/number.utils';
import type {
  DeudorGestionDeudorApi,
} from '../api/deudoresGestionDeudorApi.types';
import type {
  DeudorGestionDeudor,
} from '../types/gestionDeudor.types';
import {
  parseDeudoresGestionDeudorResponse,
} from '../validations/gestionDeudorApi.validators';

const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toStringValue = (value: unknown): string => {
  if (value === null || value === undefined) return '';
  return String(value);
};

export function mapDeudorGestionDeudor(
  item: DeudorGestionDeudorApi
): DeudorGestionDeudor {
  return {
    idDeudor: toRequiredId(
      item.nId_PersDeudor,
      'nId_PersDeudor'
    ),
    numero: toNumber(item.nro),
    zonaCampania: toStringValue(item.zonaCampanna),
    idCliente: toOptionalIdOrZero(
      item.nId_Cliente,
      'nId_Cliente'
    ),
    idContrato: toRequiredId(
      item.nId_Contrato,
      'nId_Contrato'
    ),
    idCartera: toRequiredId(
      item.nId_Cartera,
      'nId_Cartera'
    ),
    cartera: toStringValue(item.cartera),
    codigoCliente: toStringValue(item.codigoCliente),
    deudor: toStringValue(item.deudor),
    importe: toNumber(item.importe),
    saldo: toNumber(item.saldo),
    fechaUltimaGestionCall: toStringValue(item.fechaUltimaGestionCALL),
    ultimaGestionCall: toStringValue(item.ultimaGestionCALL),
    cantidadGestionCall: toNumber(item.cantidadGestionCALL),
    fechaUltimaGestionCampo: toStringValue(item.fechaUltimaGestionCAMPO),
    ultimaGestionCampo: toStringValue(item.ultimaGestionCAMPO),
    cantidadGestionCampo: toNumber(item.cantidadGestionCAMPO),
    fechaPromesa: toStringValue(item.fechaPromesa),
    mejorStatus: toStringValue(item.mejorStatus),
  };
}

export function mapDeudoresGestionDeudorResponse(
  response: unknown
): DeudorGestionDeudor[] {
  return parseDeudoresGestionDeudorResponse(
    response,
    'Error al buscar el deudor.'
  ).map(mapDeudorGestionDeudor);
}
