import {
  useMemo,
  useState,
  type FC,
} from 'react';

import type {
  UsuarioZonaItem,
} from '../types/usuarioZonas.types';

interface UsuarioZonasManagerProps {
  zonasAsignadas:
    readonly UsuarioZonaItem[];
  zonasDisponibles:
    readonly UsuarioZonaItem[];
  canInsert: boolean;
  canEdit: boolean;
  disabled?: boolean;
  onAgregar: (
    zona: UsuarioZonaItem
  ) => void;
  onQuitar: (
    zona: UsuarioZonaItem
  ) => void;
}

const normalizeSearch = (
  value: string
): string =>
  value
    .trim()
    .toLocaleLowerCase('es');

const filterZonas = (
  zonas: readonly UsuarioZonaItem[],
  search: string
): UsuarioZonaItem[] => {
  const normalized =
    normalizeSearch(search);

  if (!normalized) {
    return [...zonas];
  }

  return zonas.filter((zona) =>
    `${zona.zona} ${zona.nombre}`
      .toLocaleLowerCase('es')
      .includes(normalized)
  );
};

const EmptyState: FC<{
  message: string;
}> = ({ message }) => (
  <div className="usuario-zones-manager__empty">
    {message}
  </div>
);

export const UsuarioZonasManager:
  FC<UsuarioZonasManagerProps> = ({
    zonasAsignadas,
    zonasDisponibles,
    canInsert,
    canEdit,
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
        filterZonas(
          zonasAsignadas,
          assignedSearch
        ),
      [
        zonasAsignadas,
        assignedSearch,
      ]
    );

    const available = useMemo(
      () =>
        filterZonas(
          zonasDisponibles,
          availableSearch
        ),
      [
        zonasDisponibles,
        availableSearch,
      ]
    );

    return (
      <div className="usuario-zones-manager">
        <div className="usuario-zones-manager__column">
          <div className="usuario-zones-manager__column-header">
            <strong>
              Asignadas
            </strong>
            <span className="usuario-zones-manager__count">
              {zonasAsignadas.length}
            </span>
          </div>

          <input
            type="search"
            className="form-input usuario-zones-manager__search"
            value={assignedSearch}
            onChange={(event) => {
              setAssignedSearch(
                event.target.value
              );
            }}
            placeholder="Buscar zona asignada..."
            aria-label="Buscar zona asignada"
            disabled={disabled}
          />

          <div className="usuario-zones-manager__list">
            {assigned.length === 0 ? (
              <EmptyState
                message={
                  assignedSearch
                    ? 'No hay coincidencias.'
                    : 'No hay zonas asignadas.'
                }
              />
            ) : (
              assigned.map((zona) => (
                <div
                  key={zona.zona}
                  className="usuario-zones-manager__item"
                >
                  <span
                    className="usuario-zones-manager__name"
                    title={zona.nombre}
                  >
                    {zona.nombre}
                  </span>

                  <button
                    type="button"
                    className="usuario-zones-manager__action usuario-zones-manager__action--remove"
                    onClick={() => {
                      onQuitar(zona);
                    }}
                    disabled={
                      disabled ||
                      !canEdit
                    }
                    aria-label={`Quitar zona ${zona.nombre}`}
                    title={
                      canEdit
                        ? 'Quitar zona'
                        : 'No tiene permiso para editar asignaciones.'
                    }
                  >
                    −
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="usuario-zones-manager__column">
          <div className="usuario-zones-manager__column-header">
            <strong>
              Disponibles
            </strong>
            <span className="usuario-zones-manager__count">
              {zonasDisponibles.length}
            </span>
          </div>

          <input
            type="search"
            className="form-input usuario-zones-manager__search"
            value={availableSearch}
            onChange={(event) => {
              setAvailableSearch(
                event.target.value
              );
            }}
            placeholder="Buscar zona disponible..."
            aria-label="Buscar zona disponible"
            disabled={disabled}
          />

          <div className="usuario-zones-manager__list">
            {available.length === 0 ? (
              <EmptyState
                message={
                  availableSearch
                    ? 'No hay coincidencias.'
                    : 'No hay más zonas disponibles.'
                }
              />
            ) : (
              available.map((zona) => {
                const requiresEdit =
                  zona.estado !== null;
                const canAdd =
                  requiresEdit
                    ? canEdit
                    : canInsert;

                return (
                  <div
                    key={zona.zona}
                    className="usuario-zones-manager__item"
                  >
                    <span
                      className="usuario-zones-manager__name"
                      title={zona.nombre}
                    >
                      {zona.nombre}
                    </span>

                    <button
                      type="button"
                      className="usuario-zones-manager__action usuario-zones-manager__action--add"
                      onClick={() => {
                        onAgregar(zona);
                      }}
                      disabled={
                        disabled ||
                        !canAdd
                      }
                      aria-label={`Agregar zona ${zona.nombre}`}
                      title={
                        canAdd
                          ? requiresEdit
                            ? 'Reactivar zona'
                            : 'Agregar zona'
                          : requiresEdit
                            ? 'No tiene permiso para editar asignaciones.'
                            : 'No tiene permiso para crear asignaciones.'
                      }
                    >
                      +
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  };

export default UsuarioZonasManager;
