import { PAGO_DEUDOR_POPUP_MONEDA_SYMBOLS } from '../constants/pagoDeudorPopup.constants';

export const formatPagoPopupMonto = (
  monto: number,
  moneda: string
): string => {
  const simbolo = PAGO_DEUDOR_POPUP_MONEDA_SYMBOLS[moneda] || '';

  return `${simbolo} ${monto.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};