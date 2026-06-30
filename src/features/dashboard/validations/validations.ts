import type { TipoBusquedaDashboard } from '../types/dashboardDeudor.types';

interface ValidateDashboardSearchParams {
  idCliente?: string | null;
  tipoBusqueda: TipoBusquedaDashboard;
  valorBusqueda: string;
}

export interface DashboardSearchValidationResult {
  isValid: boolean;
  message?: string;
  valorNormalizado: string;
  busqueda: string;
}

export function validateDashboardSearch({
  idCliente,
  tipoBusqueda,
  valorBusqueda,
}: ValidateDashboardSearchParams): DashboardSearchValidationResult {
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