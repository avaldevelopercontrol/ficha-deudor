import {
  createObjectGuard,
  isInteger,
  isNumber,
  isObjectRecord,
  isString,
} from '../../../shared/utils/runtimeTypeGuards.utils';
import type {
  AdicionalMafApi,
  AdicionalMafGestionApi,
  AdicionalMafOperacionApi,
} from '../types/adicionalMaf.types';

const isNullableString = (
  value: unknown
): value is string | null => {
  return value === null || isString(value);
};

const isNonNegativeInteger = (
  value: unknown
): value is number => {
  return isInteger(value) && value >= 0;
};

const isNonNegativeNumber = (
  value: unknown
): value is number => {
  return isNumber(value) && value >= 0;
};

export const isAdicionalMafGestionApi =
  createObjectGuard<AdicionalMafGestionApi>({
    ventanaMeses: isNonNegativeInteger,
    canal: isNonNegativeInteger,
    canalNombre: isString,
    nId_DocxCobrarOpe: isNonNegativeInteger,
    nId_DocxCobrar: isNonNegativeInteger,
    fecha: isNullableString,
    estatus: isString,
    peso: isNonNegativeNumber,
    telefono: isNullableString,
    comentario: isNullableString,
    intentos: isNonNegativeInteger,
    intentosRobot: isNonNegativeInteger,
    contactosDirectos: isNonNegativeInteger,
    origenDireccion: isNullableString,
    direccion: isNullableString,
  });

export const isAdicionalMafOperacionApi =
  createObjectGuard<AdicionalMafOperacionApi>({
    operacion: isString,
    placa: isNullableString,
    diasAtraso: isNonNegativeInteger,
    nId_Ubigeo: isNonNegativeInteger,
    estadoOperacion: isNullableString,
    avanceCredito: isNullableString,
    direccionLegal: isNullableString,
    distritoLegal: isNullableString,
    provinciaLegal: isNullableString,
    departamentoLegal: isNullableString,
  });

export const isAdicionalMafApi = (
  value: unknown
): value is AdicionalMafApi => {
  if (!isObjectRecord(value)) {
    return false;
  }

  return (
    isNonNegativeInteger(value.numeroDiasNoContacto) &&
    isNullableString(value.fechaUltimoContacto) &&
    isNonNegativeInteger(value.cantidadTotalVino) &&
    isNonNegativeInteger(value.cantidadTotalPago) &&
    isNonNegativeInteger(value.cantidadTotalVino6Meses) &&
    isNonNegativeInteger(value.cantidadTotalPago6Meses) &&
    isNullableString(value.cobertura) &&
    Array.isArray(value.mejoresGestiones) &&
    value.mejoresGestiones.every(isAdicionalMafGestionApi) &&
    Array.isArray(value.operaciones) &&
    value.operaciones.every(isAdicionalMafOperacionApi)
  );
};
