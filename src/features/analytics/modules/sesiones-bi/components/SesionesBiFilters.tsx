import type { FormEvent } from 'react';

import type {
  SesionBiEstado,
  SesionesBiCatalogs,
  SesionesBiPeriodoPreset,
} from '../domain/sesionesBi.types';
import {
  getSesionBiStatusLabel,
} from '../utils/sesionesBi.utils';
import { SearchIcon } from './SesionesBiIcons';

interface SesionesBiFiltersProps {
  preset: SesionesBiPeriodoPreset;
  customFrom: string;
  customTo: string;
  reportId: number | null;
  userId: number | null;
  clientId: number | null;
  clientFilterDisabled: boolean;
  status: SesionBiEstado | null;
  searchDraft: string;
  catalogs: SesionesBiCatalogs | null;
  disabled?: boolean;
  onPresetChange: (value: SesionesBiPeriodoPreset) => void;
  onCustomRangeChange: (from: string, to: string) => void;
  onReportChange: (value: number | null) => void;
  onUserChange: (value: number | null) => void;
  onClientChange: (value: number | null) => void;
  onStatusChange: (value: SesionBiEstado | null) => void;
  onSearchDraftChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClear: () => void;
}

const toOptionalId = (value: string): number | null => {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
};

export const SesionesBiFilters = ({
  preset,
  customFrom,
  customTo,
  reportId,
  userId,
  clientId,
  clientFilterDisabled,
  status,
  searchDraft,
  catalogs,
  disabled = false,
  onPresetChange,
  onCustomRangeChange,
  onReportChange,
  onUserChange,
  onClientChange,
  onStatusChange,
  onSearchDraftChange,
  onSearchSubmit,
  onClear,
}: SesionesBiFiltersProps) => {
  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    onSearchSubmit();
  };

  return (
    <section className="sessions-bi-filters" aria-label="Filtros de sesiones BI">
      <div className="sessions-bi-filters__row">
        <label className="sessions-bi-filter">
          <span>Período</span>
          <select
            value={preset}
            disabled={disabled}
            onChange={(event) =>
              onPresetChange(event.target.value as SesionesBiPeriodoPreset)
            }
          >
            <option value="TODAY">Hoy</option>
            <option value="YESTERDAY">Ayer</option>
            <option value="LAST_7_DAYS">Últimos 7 días</option>
            <option value="LAST_30_DAYS">Últimos 30 días</option>
            <option value="CUSTOM">Personalizado</option>
          </select>
        </label>

        {preset === 'CUSTOM' && (
          <div className="sessions-bi-filter sessions-bi-filter--dates">
            <span>Rango</span>
            <div className="sessions-bi-filter__dates">
              <input
                type="date"
                value={customFrom}
                disabled={disabled}
                aria-label="Fecha desde"
                onChange={(event) =>
                  onCustomRangeChange(event.target.value, customTo)
                }
              />
              <span aria-hidden="true">—</span>
              <input
                type="date"
                value={customTo}
                disabled={disabled}
                aria-label="Fecha hasta"
                onChange={(event) =>
                  onCustomRangeChange(customFrom, event.target.value)
                }
              />
            </div>
          </div>
        )}

        <label className="sessions-bi-filter">
          <span>Reporte BI</span>
          <select
            value={reportId ?? ''}
            disabled={disabled}
            onChange={(event) => onReportChange(toOptionalId(event.target.value))}
          >
            <option value="">Todos los reportes</option>
            {(catalogs?.reports ?? []).map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
        </label>

        <label className="sessions-bi-filter">
          <span>Usuario</span>
          <select
            value={userId ?? ''}
            disabled={disabled}
            onChange={(event) => onUserChange(toOptionalId(event.target.value))}
          >
            <option value="">Todos los usuarios</option>
            {(catalogs?.users ?? []).map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
        </label>

        <label
          className={
            clientFilterDisabled
              ? 'sessions-bi-filter is-disabled'
              : 'sessions-bi-filter'
          }
        >
          <span>Cliente</span>
          <select
            value={clientFilterDisabled ? '' : clientId ?? ''}
            disabled={disabled || clientFilterDisabled}
            aria-describedby={
              clientFilterDisabled
                ? 'sessions-bi-client-filter-hint'
                : undefined
            }
            onChange={(event) => onClientChange(toOptionalId(event.target.value))}
          >
            <option value="">
              {clientFilterDisabled
                ? 'No aplica para este reporte'
                : 'Todos los clientes'}
            </option>
            {!clientFilterDisabled && (catalogs?.clients ?? []).map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
          {clientFilterDisabled && (
            <small id="sessions-bi-client-filter-hint">
              Este BI no utiliza contexto de cliente.
            </small>
          )}
        </label>

        <label className="sessions-bi-filter">
          <span>Estado</span>
          <select
            value={status ?? ''}
            disabled={disabled}
            onChange={(event) =>
              onStatusChange(
                event.target.value
                  ? event.target.value as SesionBiEstado
                  : null
              )
            }
          >
            <option value="">Todos los estados</option>
            {(catalogs?.statuses ?? ['ACTIVA', 'PAUSADA', 'CERRADA', 'EXPIRADA']).map(
              (option) => (
                <option key={option} value={option}>{getSesionBiStatusLabel(option)}</option>
              )
            )}
          </select>
        </label>
      </div>

      <div className="sessions-bi-filters__footer">
        <form className="sessions-bi-search" onSubmit={handleSearch}>
          <SearchIcon size={16} />
          <input
            value={searchDraft}
            disabled={disabled}
            placeholder="Buscar usuario, login, reporte o cliente"
            aria-label="Buscar sesiones"
            onChange={(event) => onSearchDraftChange(event.target.value)}
          />
          <button type="submit" disabled={disabled}>Buscar</button>
        </form>

        <button
          type="button"
          className="sessions-bi-clear"
          disabled={disabled}
          onClick={onClear}
        >
          Limpiar filtros
        </button>
      </div>
    </section>
  );
};
