import {
  useMemo,
  useState,
  type FC,
} from 'react';

import type {
  UsuarioGrupoItem,
} from '../types/editarUsuario.types';

interface UsuarioGroupsManagerProps {
  gruposActuales:
    readonly UsuarioGrupoItem[];
  gruposDisponibles:
    readonly UsuarioGrupoItem[];
  error?: string;
  disabled?: boolean;
  onAgregar: (
    grupo: UsuarioGrupoItem
  ) => void;
  onQuitar: (
    grupo: UsuarioGrupoItem
  ) => void;
}

const normalizeSearch = (
  value: string
): string =>
  value
    .trim()
    .toLocaleLowerCase('es');

const filterGroups = (
  groups: readonly UsuarioGrupoItem[],
  search: string
): UsuarioGrupoItem[] => {
  const normalized =
    normalizeSearch(search);

  if (!normalized) {
    return [...groups];
  }

  return groups.filter((group) =>
    group.nombre
      .toLocaleLowerCase('es')
      .includes(normalized)
  );
};

const GroupEmptyState: FC<{
  message: string;
}> = ({ message }) => (
  <div className="usuario-groups-manager__empty">
    {message}
  </div>
);

export const UsuarioGroupsManager:
  FC<UsuarioGroupsManagerProps> = ({
    gruposActuales,
    gruposDisponibles,
    error,
    disabled = false,
    onAgregar,
    onQuitar,
  }) => {
    const [assignedSearch, setAssignedSearch] =
      useState('');
    const [availableSearch, setAvailableSearch] =
      useState('');

    const assigned = useMemo(
      () =>
        filterGroups(
          gruposActuales,
          assignedSearch
        ),
      [
        gruposActuales,
        assignedSearch,
      ]
    );

    const available = useMemo(
      () =>
        filterGroups(
          gruposDisponibles,
          availableSearch
        ),
      [
        gruposDisponibles,
        availableSearch,
      ]
    );

    return (
      <div className="usuario-groups-manager">
        <div className="usuario-groups-manager__column">
          <div className="usuario-groups-manager__column-header">
            <strong>
              Asignados
            </strong>
            <span className="usuario-groups-manager__count">
              {gruposActuales.length}
            </span>
          </div>

          <input
            type="search"
            className="form-input usuario-groups-manager__search"
            value={assignedSearch}
            onChange={(event) => {
              setAssignedSearch(
                event.target.value
              );
            }}
            placeholder="Buscar grupo asignado..."
            aria-label="Buscar grupo asignado"
            disabled={disabled}
          />

          <div className="usuario-groups-manager__list">
            {assigned.length === 0 ? (
              <GroupEmptyState
                message={
                  assignedSearch
                    ? 'No hay coincidencias.'
                    : 'No hay grupos asignados.'
                }
              />
            ) : (
              assigned.map((group) => (
                <div
                  key={group.idGrupo}
                  className="usuario-groups-manager__item"
                >
                  <span
                    className="usuario-groups-manager__name"
                    title={group.nombre}
                  >
                    {group.nombre}
                  </span>

                  <button
                    type="button"
                    className="usuario-groups-manager__action usuario-groups-manager__action--remove"
                    onClick={() => {
                      onQuitar(group);
                    }}
                    disabled={disabled}
                    aria-label={`Quitar grupo ${group.nombre}`}
                    title="Quitar grupo"
                  >
                    −
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="usuario-groups-manager__column">
          <div className="usuario-groups-manager__column-header">
            <strong>
              Disponibles
            </strong>
            <span className="usuario-groups-manager__count">
              {gruposDisponibles.length}
            </span>
          </div>

          <input
            type="search"
            className="form-input usuario-groups-manager__search"
            value={availableSearch}
            onChange={(event) => {
              setAvailableSearch(
                event.target.value
              );
            }}
            placeholder="Buscar grupo disponible..."
            aria-label="Buscar grupo disponible"
            disabled={disabled}
          />

          <div className="usuario-groups-manager__list">
            {available.length === 0 ? (
              <GroupEmptyState
                message={
                  availableSearch
                    ? 'No hay coincidencias.'
                    : 'No hay más grupos disponibles.'
                }
              />
            ) : (
              available.map((group) => (
                <div
                  key={group.idGrupo}
                  className="usuario-groups-manager__item"
                >
                  <span
                    className="usuario-groups-manager__name"
                    title={group.nombre}
                  >
                    {group.nombre}
                  </span>

                  <button
                    type="button"
                    className="usuario-groups-manager__action usuario-groups-manager__action--add"
                    onClick={() => {
                      onAgregar(group);
                    }}
                    disabled={disabled}
                    aria-label={`Agregar grupo ${group.nombre}`}
                    title="Agregar grupo"
                  >
                    +
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {error && (
          <div
            className="form-error usuario-groups-manager__error"
            role="alert"
          >
            {error}
          </div>
        )}
      </div>
    );
  };

export default UsuarioGroupsManager;
