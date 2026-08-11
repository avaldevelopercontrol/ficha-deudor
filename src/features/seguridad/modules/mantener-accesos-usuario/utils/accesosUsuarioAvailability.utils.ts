import type {
  UsuarioGrupoOpcionListado,
} from '../../../types/usuarioGrupoOpcion.types';

import type {
  UsuarioSearchOption,
} from './usuarioSearch.utils';

const isValidId = (
  value: number | ''
): value is number =>
  typeof value === 'number' &&
  Number.isSafeInteger(value) &&
  value > 0;

export const hasUsuarioGrupoAccess = (
  accesos: readonly UsuarioGrupoOpcionListado[],
  usuarioId: number | '',
  grupoId: number | ''
): boolean => {
  if (
    !isValidId(usuarioId) ||
    !isValidId(grupoId)
  ) {
    return false;
  }

  return accesos.some(
    (acceso) =>
      acceso.idUsuario === usuarioId &&
      acceso.idGrupo === grupoId
  );
};

export const getAssignedUsuarioIdsForGrupo = (
  accesos: readonly UsuarioGrupoOpcionListado[],
  grupoId: number | ''
): ReadonlySet<number> => {
  if (!isValidId(grupoId)) {
    return new Set<number>();
  }

  return new Set(
    accesos
      .filter(
        (acceso) =>
          acceso.idGrupo === grupoId
      )
      .map((acceso) => acceso.idUsuario)
  );
};

export const filterAvailableUsuarioOptionsForGrupo = (
  options: readonly UsuarioSearchOption[],
  accesos: readonly UsuarioGrupoOpcionListado[],
  grupoId: number | ''
): UsuarioSearchOption[] => {
  if (!isValidId(grupoId)) {
    return [];
  }

  const assignedUsuarioIds =
    getAssignedUsuarioIdsForGrupo(
      accesos,
      grupoId
    );

  return options.filter(
    (option) =>
      !assignedUsuarioIds.has(option.id)
  );
};
