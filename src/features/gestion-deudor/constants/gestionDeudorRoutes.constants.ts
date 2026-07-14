import { FICHA_DEUDOR_ROUTES } from '@features/ficha-deudor/shared/constants/fichaDeudorRoutes.constants';

export const GESTION_DEUDOR_ROUTES = {
  fichaDeudor:
    FICHA_DEUDOR_ROUTES.FICHA_DEUDOR,
} as const;

export const FICHA_DEUDOR_QUERY_PARAM_KEYS = {
  idCliente: 'id_cliente',
  idCartera: 'id_cartera',
  idDeudor: 'id_deudor',
  idContrato: 'id_contrato',
  idUsuario: 'id_usuario',
  fechaInicioGestion:
    'fecha_inicio_gestion',
} as const;