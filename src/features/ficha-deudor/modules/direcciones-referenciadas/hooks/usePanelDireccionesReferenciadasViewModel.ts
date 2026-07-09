import type { FichaDeudorReferenciaPanelParams } from '../../../shared/types/fichaDeudor.types';
import { useDireccionesReferenciadas } from './useDireccionesReferenciadas';
import { usePanelDireccionesReferenciadasActions } from './usePanelDireccionesReferenciadasActions';
import { usePanelDireccionesReferenciadasColumns } from './usePanelDireccionesReferenciadasColumns';

interface UsePanelDireccionesReferenciadasViewModelParams {
  params: FichaDeudorReferenciaPanelParams;
}

export const usePanelDireccionesReferenciadasViewModel = ({
  params,
}: UsePanelDireccionesReferenciadasViewModelParams) => {
  const direcciones = useDireccionesReferenciadas(params);

  const actions = usePanelDireccionesReferenciadasActions({
    create: direcciones.create,
    update: direcciones.update,
  });

  const { columns } = usePanelDireccionesReferenciadasColumns({
    onEdit: actions.handleEdit,
  });

  return {
    ...direcciones,
    ...actions,
    columns,
  };
};