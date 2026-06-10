import type { DeudorInfo, CabeceraInfo, MejorRInfo} from '../../../../shared/types';

const cabeceraDefault: CabeceraInfo = {
  zona: 'LIMA',
  cartera: 'CORP_TOP_INT_FEB-26',
  campana: 'CAMP-001'
};

const deudorDefault: DeudorInfo = {
  nombreRazonSocial: 'S.A.A. INVERSIONES CENTENARIO',
  dniRuc: '20101045995',
  gradoInstruccion: 'Superior',
  edad: '45',
  contacto: '', // o lo que corresponda
  //asesorAsignado: 'Juan Pérez',
  asesorPostVenta: 'María López',
  asesorComercial: 'Carlos Ruiz',
  correoApv: 'apv@ejemplo.com',
  correoAc: 'ac@ejemplo.com',
};

const mejorResultadoDefault: MejorRInfo = {
  mejorResultado: 'Ayala'
};

export const mockMejorRHeader: Record<string, MejorRInfo> = {
  '178': mejorResultadoDefault,
  '201': { ...mejorResultadoDefault, mejorResultado: 'Juan' },
  default: mejorResultadoDefault,
};

export const mockCabeceraHeader: Record<string, CabeceraInfo> = {
  '178': cabeceraDefault,
  '201': { ...cabeceraDefault, zona: 'OTRA ZONA' },
  default: cabeceraDefault,
};

export const mockDeudorHeader: Record<string, DeudorInfo> = {
  '178': deudorDefault,
  '201': { ...deudorDefault, nombreRazonSocial: 'OTRA EMPRESA S.A.C.' },
  default: deudorDefault,
};
