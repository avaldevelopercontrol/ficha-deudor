import type { DeudorInfo } from '../../../../shared/types';

const deudorDefault: DeudorInfo = {
  zona: 'LIMA',
  cartera: 'CORP_TOP_INT_FEB-26',
  campana: 'CAMP-001',
  nombreRazonSocial: 'S.A.A. INVERSIONES CENTENARIO',
  dniRuc: '20101045995',
  gradoInstruccion: 'Superior',
  edad: 45,
  contacto: '', // o lo que corresponda
  asesorAsignado: 'Juan Pérez',
  asesorPostVenta: 'María López',
  asesorComercial: 'Carlos Ruiz',
  correoApv: 'apv@ejemplo.com',
  correoAc: 'ac@ejemplo.com',
  mejorResultado: 'Ayala',
};

export const mockDeudorHeader: Record<string, DeudorInfo> = {
  '178': deudorDefault,
  '201': { ...deudorDefault, nombreRazonSocial: 'OTRA EMPRESA S.A.C.' },
  default: deudorDefault,
};