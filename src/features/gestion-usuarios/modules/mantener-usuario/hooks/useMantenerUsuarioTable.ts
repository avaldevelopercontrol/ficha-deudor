import { useUsuariosListTable } from '../../../hooks/useUsuariosListTable';

export const useMantenerUsuarioTable = () => {
  return useUsuariosListTable({
    initialPageSize: 10,
  });
};