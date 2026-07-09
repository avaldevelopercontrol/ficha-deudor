import {
  FICHA_DEUDOR_QUERY_PARAM_KEYS,
  GESTION_DEUDOR_ROUTES,
} from '../constants/gestionDeudorRoutes.constants';
import type { DeudorGestionDeudor } from '../types/gestionDeudor.types';

interface BuildFichaDeudorUrlParams {
  row: DeudorGestionDeudor;
  idCliente: string;
  idUsuario: string;
  fechaInicioGestion?: Date;
}

export const buildFichaDeudorUrl = ({
  row,
  idCliente,
  idUsuario,
  fechaInicioGestion = new Date(),
}: BuildFichaDeudorUrlParams): string => {
  const queryParams = new URLSearchParams({
    [FICHA_DEUDOR_QUERY_PARAM_KEYS.idCliente]: String(
      row.nId_Cliente || idCliente
    ),
    [FICHA_DEUDOR_QUERY_PARAM_KEYS.idCartera]: String(row.nId_Cartera),
    [FICHA_DEUDOR_QUERY_PARAM_KEYS.idDeudor]: String(row.nId_PersDeudor),
    [FICHA_DEUDOR_QUERY_PARAM_KEYS.idContrato]: String(row.nId_Contrato),
    [FICHA_DEUDOR_QUERY_PARAM_KEYS.idUsuario]: String(idUsuario),
    [FICHA_DEUDOR_QUERY_PARAM_KEYS.fechaInicioGestion]:
      fechaInicioGestion.toISOString(),
  });

  return `${GESTION_DEUDOR_ROUTES.fichaDeudor}?${queryParams.toString()}`;
};
