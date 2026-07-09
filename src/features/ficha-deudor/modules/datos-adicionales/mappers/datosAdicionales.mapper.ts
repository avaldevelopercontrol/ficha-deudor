import type {
  CabeceraDatosAdicionalesApi,
  ColumnApi,
} from '../../../shared/types';

export const mapCabeceraDatosAdicionalesToColumns = (
  cabecera: CabeceraDatosAdicionalesApi
): ColumnApi[] => {
  const columns: ColumnApi[] = [];

  for (const [key, value] of Object.entries(cabecera)) {
    if (key === 'idCab') continue;

    const label = String(value);
    const type = inferDatosAdicionalesTypeFromLabel(key, label);

    columns.push({ key, label, type });
  }

  return columns;
};

const inferDatosAdicionalesTypeFromLabel = (
  key: string,
  label: string
): ColumnApi['type'] => {
  const lowerKey = key.toLowerCase();
  const lowerLabel = label.toLowerCase();

  if (
    lowerKey.includes('monto') ||
    lowerKey.includes('importe') ||
    lowerKey.includes('saldo') ||
    lowerKey.includes('deuda')
  ) {
    return 'money';
  }

  if (lowerKey.includes('atraso') || lowerKey.includes('dias')) {
    return 'atraso';
  }

  if (lowerKey.includes('fecha') || lowerKey.includes('vencimiento')) {
    return 'date';
  }

  if (
    lowerKey === 'estado' ||
    lowerKey.includes('estadoservicio') ||
    lowerKey.includes('estado_')
  ) {
    return 'estado';
  }

  if (
    lowerLabel.includes('monto') ||
    lowerLabel.includes('importe') ||
    lowerLabel.includes('saldo')
  ) {
    return 'money';
  }

  return 'text';
};