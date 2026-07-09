import type { TelefonoReferenciado } from '../types/telefono.types';
import type { FichaDeudorReferenciaPanelParams } from '../../../shared/types/fichaDeudor.types';
import { usePanelTelefonosReferenciadosActions } from './usePanelTelefonosReferenciadosActions';
import { usePanelTelefonosReferenciadosColumns } from './usePanelTelefonosReferenciadosColumns';
import { useTelefonosReferenciados } from './useTelefonosReferenciados';

interface UsePanelTelefonosReferenciadosViewModelParams {
  params: FichaDeudorReferenciaPanelParams;
  onSelectTelefono?: (telefono: string) => void;
}

export const usePanelTelefonosReferenciadosViewModel = ({
  params,
  onSelectTelefono,
}: UsePanelTelefonosReferenciadosViewModelParams) => {
  const telefonos = useTelefonosReferenciados(params);

  const actions = usePanelTelefonosReferenciadosActions({
    create: telefonos.create,
    update: telefonos.update,
  });

  const { columns } = usePanelTelefonosReferenciadosColumns({
    onEdit: actions.handleEdit,
    onSelectTelefono,
  });

  const handleDocumentoTelefonoClick = (row: TelefonoReferenciado) => {
    onSelectTelefono?.(row.numero);
  };

  return {
    ...telefonos,
    ...actions,
    columns,
    handleDocumentoTelefonoClick,
  };
};