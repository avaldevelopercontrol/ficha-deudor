import type { TipoBusquedaGestionDeudor } from '../types/gestionDeudor.types';

interface ValidateGestionDeudorSearchParams {
  idCliente?: string | null;
  tipoBusqueda: TipoBusquedaGestionDeudor;
  valorBusqueda: string;
}

export interface GestionDeudorSearchValidationResult {
  isValid: boolean;
  message?: string;
  valorNormalizado: string;
  busqueda: string;
}

export function validateGestionDeudorSearch({
  idCliente,
  tipoBusqueda,
  valorBusqueda,
}: ValidateGestionDeudorSearchParams): GestionDeudorSearchValidationResult {
  const valorNormalizado = valorBusqueda.trim().replace(/\s+/g, '');

  if (!idCliente) {
    return {
      isValid: false,
      message: 'No se encontró el cliente seleccionado.',
      valorNormalizado,
      busqueda: '',
    };
  }

  if (!valorNormalizado) {
    return {
      isValid: false,
      message: 'Ingrese un dato para realizar la búsqueda.',
      valorNormalizado,
      busqueda: '',
    };
  }

  if (!/^\d+$/.test(valorNormalizado)) {
    return {
      isValid: false,
      message: 'El dato ingresado solo debe contener números.',
      valorNormalizado,
      busqueda: '',
    };
  }

  if (tipoBusqueda === 'D' && valorNormalizado.length !== 8) {
    return {
      isValid: false,
      message: 'El DNI debe tener 8 dígitos.',
      valorNormalizado,
      busqueda: '',
    };
  }

  if (tipoBusqueda === 'R' && valorNormalizado.length !== 11) {
    return {
      isValid: false,
      message: 'El RUC debe tener 11 dígitos.',
      valorNormalizado,
      busqueda: '',
    };
  }

  if (
    tipoBusqueda === 'T' &&
    (valorNormalizado.length < 6 || valorNormalizado.length > 15)
  ) {
    return {
      isValid: false,
      message: 'El teléfono debe tener entre 6 y 15 dígitos.',
      valorNormalizado,
      busqueda: '',
    };
  }

  return {
    isValid: true,
    valorNormalizado,
    busqueda: `${tipoBusqueda}${valorNormalizado}`,
  };
}