import type {
  DeudorGestionDeudor,
  DeudorGestionDeudorApi,
} from '@features/gestion-deudor/types/gestionDeudor.types';

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
  ...createDeudorGestionApi(),
  ...overrides,
});
