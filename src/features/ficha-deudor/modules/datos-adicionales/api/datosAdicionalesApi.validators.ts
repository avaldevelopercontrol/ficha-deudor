import {
  isInteger,
  isObjectRecord,
} from '../../../shared/utils/runtimeTypeGuards.utils';
import type {
  CabeceraDatosAdicionalesApi,
  DatoAdicionalApi,
} from '../../../shared/types';

export const isCabeceraDatosAdicionalesApi = (
  value: unknown
): value is CabeceraDatosAdicionalesApi => {
  if (!isObjectRecord(value)) {
    return false;
  }

  const { idCab } = value;

  return (
    idCab === undefined ||
    idCab === null ||
    isInteger(idCab)
  );
};

export const isDatoAdicionalApi = (
  value: unknown
): value is DatoAdicionalApi => {
  return (
    isObjectRecord(value) &&
    isInteger(value.nId_DocxCobrarAd) &&
    isInteger(value.nId_DocxCobrar) &&
    isInteger(value.nId_PersDeudor) &&
    isInteger(value.nId_Cartera) &&
    isInteger(value.nId_Cliente)
  );
};
