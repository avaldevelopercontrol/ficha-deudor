import type { DocumentoApi } from '@features/ficha-deudor/shared/types';
import type { FichaDeudorGestionFormParams } from '@features/ficha-deudor/shared/types/fichaDeudor.types';
import type { PaletaRespuestaOption } from '@features/ficha-deudor/shared/utils/selectOptions.utils';
import type { GestionFormClaro } from '@features/ficha-deudor/modules/gestion/types/fichaGestionForm.types';

export const createGestionForm = (
  overrides: Partial<GestionFormClaro> = {}
): GestionFormClaro => ({
  nombreContacto: ' Ana Torres ',
  cargo: ' Titular ',
  np0: '10',
  np1: '20',
  np2: '30',
  estadoGestion: '40',
  telefono: '987654321',
  tipoGestion: '3',
  gestorId: '',
  gestorNombre: '',
  fechaCompromisoPago: '2026-08-10',
  compromisoSoles: '150,50',
  compromisoUSD: '20.25',
  fechaNuevaGestion: '2026-08-11',
  horaNuevaGestion: '14:35',
  fechaGestion: '2026-08-04',
  horaGestion: '09:15',
  gestionTerminada: false,
  observaciones: ' Confirmó el compromiso. ',
  estadoGestionClaro: '50',
  motivoNoPago: '60',
  ...overrides,
});

export const createFichaParams = (
  overrides: Partial<FichaDeudorGestionFormParams> = {}
): FichaDeudorGestionFormParams => ({
  id_cliente: '1',
  id_cartera: '2',
  id_deudor: '3',
  id_contrato: '4',
  id_usuario: '5',
  fecha_inicio_gestion: '2026-08-04T09:00:00.000',
  ...overrides,
});

export const createDocumento = (
  id: number,
  overrides: Partial<DocumentoApi> = {}
): DocumentoApi => ({
  nId_DocxCobrar: id,
  mejorStatus: 1,
  nId_Moneda: 1,
  bEstado: 1,
  nZona: 'LIMA',
  bSelected: true,
  nId_Estrategia: 1,
  nId_Cartera: 2,
  ...overrides,
});

export const NP1_OPTIONS: PaletaRespuestaOption[] = [
  { id: '20', label: 'CONTACTO DIRECTO (101)', idTipoContacto: 1 },
];

export const NP2_OPTIONS: PaletaRespuestaOption[] = [
  { id: '30', label: 'COMPROMISO DE PAGO (202)', idTipoContacto: 2 },
];

export const NP2_SIN_DATO_OPTIONS: PaletaRespuestaOption[] = [
  { id: '0', label: 'SIN DATO (0)', idTipoContacto: null },
];
