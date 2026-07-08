import type { MejorRInfo } from '../types/deudor.types';

const mejorResultadoDefault: MejorRInfo = {
  mejorResultado: 'Ayala'
};

export const mockMejorRHeader: Record<string, MejorRInfo> = {
  '178': mejorResultadoDefault,
  '201': { ...mejorResultadoDefault, mejorResultado: 'Juan' },
  default: mejorResultadoDefault,
};