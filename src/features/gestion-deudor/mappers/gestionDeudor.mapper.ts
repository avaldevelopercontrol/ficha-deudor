import {
  normalizeApiCollectionResponse,
} from '@shared/api/apiResponse.utils';
import {
  toOptionalIdOrZero,
  toRequiredId,
} from '@shared/utils/number.utils';
import type {
  DeudorGestionDeudor,
  DeudorGestionDeudorApi,
  GetDeudoresGestionDeudorResponse,
} from '../types/gestionDeudor.types';

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
    nId_PersDeudor: toRequiredId(
      item.nId_PersDeudor,
      'nId_PersDeudor'
    ),
    nro: toNumber(item.nro),
    zonaCampanna: toStringValue(item.zonaCampanna),
    nId_Cliente: toOptionalIdOrZero(
      item.nId_Cliente,
      'nId_Cliente'
    ),
    nId_Contrato: toRequiredId(
      item.nId_Contrato,
      'nId_Contrato'
    ),
    nId_Cartera: toRequiredId(
      item.nId_Cartera,
      'nId_Cartera'
    ),
    cartera: toStringValue(item.cartera),
    codigoCliente: toStringValue(item.codigoCliente),
    deudor: toStringValue(item.deudor),
    importe: toNumber(item.importe),
    saldo: toNumber(item.saldo),
    fechaUltimaGestionCALL: toStringValue(item.fechaUltimaGestionCALL),
    ultimaGestionCALL: toStringValue(item.ultimaGestionCALL),
    cantidadGestionCALL: toNumber(item.cantidadGestionCALL),
    fechaUltimaGestionCAMPO: toStringValue(item.fechaUltimaGestionCAMPO),
    ultimaGestionCAMPO: toStringValue(item.ultimaGestionCAMPO),
    cantidadGestionCAMPO: toNumber(item.cantidadGestionCAMPO),
    fechaPromesa: toStringValue(item.fechaPromesa),
    mejorStatus: toStringValue(item.mejorStatus),
  };
}

export function mapDeudoresGestionDeudorResponse(
  result: GetDeudoresGestionDeudorResponse
): DeudorGestionDeudor[] {
  return normalizeApiCollectionResponse<
    DeudorGestionDeudorApi
  >(
    result.response,
    'Error al buscar el deudor.'
  ).map(mapDeudorGestionDeudor);
}
