import {
  createObjectGuard,
  isInteger,
  isNumber,
  isString,
} from '../../../shared/utils/runtimeTypeGuards.utils';
import type { PagoApi } from '../types/pago.types';

export const isPagoApi = createObjectGuard<PagoApi>({
  nro: isInteger,
  codigoCliente: isString,
  nroDocumento: isString,
  fechaPago: isString,
  montoPago: isNumber,
  moneda: isString,
  zona: isString,
  notaCredito: isString,
  marca: isString,
});
