import type { UseTelefonosReferenciadosReturn } from './useTelefonosReferenciados';

import { usePanelTelefonosReferenciadosActions } from './usePanelTelefonosReferenciadosActions';

import { usePanelTelefonosReferenciadosColumns } from './usePanelTelefonosReferenciadosColumns';

interface UsePanelTelefonosReferenciadosViewModelParams {
  resource: UseTelefonosReferenciadosReturn;
  onSelectTelefono: (
    telefono: string
  ) => void;
}

export const usePanelTelefonosReferenciadosViewModel =
  ({
    resource,
    onSelectTelefono,
  }: UsePanelTelefonosReferenciadosViewModelParams) => {
    const actions =
      usePanelTelefonosReferenciadosActions({
        create: resource.create,
        update: resource.update,
      });

    const { columns } =
      usePanelTelefonosReferenciadosColumns({
        onEdit: actions.handleEdit,
        onSelectTelefono,
      });

    return {
      ...resource,
      ...actions,
      columns,
    };
  };