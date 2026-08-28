import { isObjectRecord } from '../../../shared/utils/runtimeTypeGuards.utils';
import type {
  InfDeudorCabeceraApi,
  InfDeudorParamApi,
} from '../types/infDeudor.types';

export const isInfDeudorCabeceraApi = (
  value: unknown
): value is InfDeudorCabeceraApi => {
  if (!isObjectRecord(value)) {
    return false;
  }

  return Object.entries(value).every(([key, fieldValue]) => {
    if (!key.startsWith('cNombre_Param')) {
      return true;
    }

    return (
      fieldValue === null ||
      fieldValue === undefined ||
      typeof fieldValue === 'string'
    );
  });
};

export const isInfDeudorParamApi = (
  value: unknown
): value is InfDeudorParamApi => {
  if (!isObjectRecord(value)) {
    return false;
  }

  return Object.entries(value).every(([key, fieldValue]) => {
    if (!key.startsWith('cPersInf_Param')) {
      return true;
    }

    return (
      fieldValue === null ||
      fieldValue === undefined ||
      typeof fieldValue === 'string'
    );
  });
};
