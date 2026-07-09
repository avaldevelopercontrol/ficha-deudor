import type { MejorRInfo } from '../types';

const mejorResultadoDefault: MejorRInfo = {
  mejorResultado: 'Ayala'
};

export const mockMejorRHeader: Record<string, MejorRInfo> = {
  '178': mejorResultadoDefault,
  '201': { ...mejorResultadoDefault, mejorResultado: 'Juan' },
  default: mejorResultadoDefault,
};