import {
  createObjectGuard,
  isString,
} from '../../../shared/utils/runtimeTypeGuards.utils';
import type {
  CabeceraInfoApi,
  DeudorInfoApi,
} from '../../../shared/types';

export const isCabeceraInfoApi = createObjectGuard<CabeceraInfoApi>({
  ciudad: isString,
  cCar_Nombre: isString,
  cCampanna: isString,
});

export const isDeudorInfoApi = createObjectGuard<DeudorInfoApi>({
  dni: isString,
  ruc: isString,
  nombre: isString,
  nombreCompleto: isString,
  gradoInstruccion: isString,
  edad: isString,
  correo: isString,
  asesorPostVenta: isString,
  correoAsesorPostVenta: isString,
  asesorComercial: isString,
  correoAsesorComercial: isString,
  clientePorVision: isString,
  clienteListaBlanca: isString,
  clienteConSinPe: isString,
});
