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
    nId_PersDeudor: toNumber(item.nId_PersDeudor),
    nro: toNumber(item.nro),
    zonaCampanna: toStringValue(item.zonaCampanna),
    nId_Cliente: toNumber(item.nId_Cliente),
    nId_Contrato: toNumber(item.nId_Contrato),
    nId_Cartera: toNumber(item.nId_Cartera),
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
  const response = Array.isArray(result.response)
    ? result.response
    : result.response
      ? [result.response]
      : [];

  return response.map(mapDeudorGestionDeudor);
}
