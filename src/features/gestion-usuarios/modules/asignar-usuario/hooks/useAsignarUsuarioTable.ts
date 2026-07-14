import { useUsuariosListTable } from '../../../hooks/useUsuariosListTable';

export const useAsignarUsuarioTable = () => {
  return useUsuariosListTable({
    initialPageSize: 10,
  });
};