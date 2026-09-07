import type {
  DeudorGestionDeudorApi,
} from '@features/gestion-cobranzas/modules/gestion-deudor/api/deudoresGestionDeudorApi.types';
import type {
  DeudorGestionDeudor,
} from '@features/gestion-cobranzas/modules/gestion-deudor/types/gestionDeudor.types';

export const createDeudorGestionApi = (
  overrides: Partial<DeudorGestionDeudorApi> = {}
): DeudorGestionDeudorApi => ({
  nId_PersDeudor: 301,
  nro: 1,
  zonaCampanna: 'LIMA - AGOSTO',
  nId_Cliente: 10,
  nId_Contrato: 20,
  nId_Cartera: 30,
  cartera: 'CARTERA PRINCIPAL',
  codigoCliente: 'CLI-001',
  deudor: 'EMPRESA DE PRUEBA SAC',
  importe: 1250.5,
  saldo: 900.25,
  fechaUltimaGestionCALL: '04/08/2026',
  ultimaGestionCALL: 'CONTACTO DIRECTO',
  cantidadGestionCALL: 2,
  fechaUltimaGestionCAMPO: '03/08/2026',
  ultimaGestionCAMPO: 'VISITA EFECTIVA',
  cantidadGestionCAMPO: 1,
  fechaPromesa: '10/08/2026',
  mejorStatus: 'COMPROMISO DE PAGO',
  ...overrides,
});

export const createDeudorGestion = (
  overrides: Partial<DeudorGestionDeudor> = {}
): DeudorGestionDeudor => ({
  idDeudor: 301,
  numero: 1,
  zonaCampania: 'LIMA - AGOSTO',
  idCliente: 10,
  idContrato: 20,
  idCartera: 30,
  cartera: 'CARTERA PRINCIPAL',
  codigoCliente: 'CLI-001',
  deudor: 'EMPRESA DE PRUEBA SAC',
  importe: 1250.5,
  saldo: 900.25,
  fechaUltimaGestionCall: '04/08/2026',
  ultimaGestionCall: 'CONTACTO DIRECTO',
  cantidadGestionCall: 2,
  fechaUltimaGestionCampo: '03/08/2026',
  ultimaGestionCampo: 'VISITA EFECTIVA',
  cantidadGestionCampo: 1,
  fechaPromesa: '10/08/2026',
  mejorStatus: 'COMPROMISO DE PAGO',
  ...overrides,
});
