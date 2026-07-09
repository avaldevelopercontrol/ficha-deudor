import { PANEL_DATOS_ADICIONALES_NIVEL } from '../constants/panelDatosAdicionales.constants';
import type { FichaDeudorCarteraPanelParams } from '../../../shared/types/fichaDeudor.types';
import { useDatosAdicionales } from './useDatosAdicionales';
import { usePanelDatosAdicionalesColumns } from './usePanelDatosAdicionalesColumns';

interface UsePanelDatosAdicionalesViewModelParams {
  params: FichaDeudorCarteraPanelParams;
}

export const usePanelDatosAdicionalesViewModel = ({
  params,
}: UsePanelDatosAdicionalesViewModelParams) => {
  const { id_cliente, id_cartera, id_deudor } = params;

  const datosAdicionales = useDatosAdicionales(
    id_cliente,
    id_cartera,
    id_deudor,
    PANEL_DATOS_ADICIONALES_NIVEL
  );

  const { tableColumns } = usePanelDatosAdicionalesColumns(
    datosAdicionales.columns
  );

  return {
    ...datosAdicionales,
    tableColumns,
  };
};