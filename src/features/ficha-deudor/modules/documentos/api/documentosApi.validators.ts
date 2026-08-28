import {
  createObjectGuard,
  isBoolean,
  isInteger,
  isOptionalString,
  isString,
} from '../../../shared/utils/runtimeTypeGuards.utils';
import type {
  BotonApi,
  CabeceraPantallaApi,
  DocumentoApi,
} from '../../../shared/types';

export const isCabeceraPantallaApi =
  createObjectGuard<CabeceraPantallaApi>({
    tituloCabeceraPantalla: isString,
    tipoDato: isString,
    orden: isInteger,
  });

export const isBotonApi = createObjectGuard<BotonApi>({
  id: isString,
  label: isString,
  action: isOptionalString,
  popupUrl: isOptionalString,
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
