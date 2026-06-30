import type { SelectOption } from '../../../shared/types';

export const opcionesNP0: SelectOption[] = [
  { id: 'C', label: 'C - Contacto' },
  { id: 'NC', label: 'NC - No Contacto' },
  { id: 'NE', label: 'NE - No Efectivo' },
];

export const opcionesNP1: Record<string, SelectOption[]> = {
  C: [
    { id: 'CP', label: 'CP - Promesa de Pago' },
    { id: 'CR', label: 'CR - Reclamo' },
    { id: 'CN', label: 'CN - Negativa de Pago' },
    { id: 'CI', label: 'CI - Sin Intención' },
  ],
  NC: [
    { id: 'NCA', label: 'NCA - No Atiende' },
    { id: 'NCB', label: 'NCB - Buzón de Voz' },
    { id: 'NCC', label: 'NCC - Apagado' },
    { id: 'NCD', label: 'NCD - Fuera de Servicio' },
  ],
  NE: [
    { id: 'NEA', label: 'NEA - Número Equivocado' },
    { id: 'NEB', label: 'NEB - No es el titular' },
  ],
};

export const opcionesNP2: Record<string, SelectOption[]> = {
  CP: [
    { id: 'CP1', label: 'CP1 - Pago Hoy' },
    { id: 'CP2', label: 'CP2 - Pago Esta Semana' },
    { id: 'CP3', label: 'CP3 - Pago Este Mes' },
  ],
  CR: [
    { id: 'CR1', label: 'CR1 - Reclamo por Cobro' },
    { id: 'CR2', label: 'CR2 - Reclamo por Tasa' },
  ],
  CN: [
    { id: 'CN1', label: 'CN1 - No tiene dinero' },
    { id: 'CN2', label: 'CN2 - No reconoce deuda' },
    { id: 'CN3', label: 'CN3 - Discapacidad' },
  ],
  CI: [{ id: 'CI1', label: 'CI1 - Indiferente' }],
  NCA: [{ id: 'NCA1', label: 'NCA1 - Suena y no atiende' }],
  NCB: [{ id: 'NCB1', label: 'NCB1 - Dejó buzón' }],
  NCC: [{ id: 'NCC1', label: 'NCC1 - Sin señal' }],
  NCD: [{ id: 'NCD1', label: 'NCD1 - Número dado de baja' }],
  NEA: [{ id: 'NEA1', label: 'NEA1 - Número incorrecto' }],
  NEB: [{ id: 'NEB1', label: 'NEB1 - Otra persona' }],
};

export const botonesAccionPorPerfil: Record<string, string[]> = {
  default: [
    '+ESTADO_CUENTA', '+DATOS_CLIENTE', '+CARTAS', '+ESTADO_DOCUMENTO',
    '+Contratos', '+MejorGestHist', '+GESTION DOCUMENTOS', '+AGENDAS',
    '+PAGOS', '+INF.DEUDOR', '+AVAL', '+EMAIL',
  ],
};

export const botonesEstaticos = [
  'DATOS ADICIONALES', 'TELÉFONOS REFERENCIADOS', 'DIRECCIONES REFERENCIADAS',
  'GESTIÓN REALIZADA', 'ESTADO DE GESTIÓN REALIZADA',
];