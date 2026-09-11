import {
  createObjectGuard,
  isBoolean,
  isInteger,
  isString,
} from '../../../shared/utils/runtimeTypeGuards.utils';
import type {
  CabeceraPantallaApi,
  DocumentoApi,
} from '../../../shared/types';

export const isCabeceraPantallaApi =
  createObjectGuard<CabeceraPantallaApi>({
    tituloCabeceraPantalla: isString,
    tipoDato: isString,
    orden: isInteger,
  });

export const isDocumentoApi = createObjectGuard<DocumentoApi>({
  nId_DocxCobrar: isInteger,
  mejorStatus: isInteger,
  nId_Moneda: isInteger,
  bEstado: isInteger,
  nZona: isString,
  bSelected: isBoolean,
  nId_Estrategia: isInteger,
  nId_Cartera: isInteger,
});
