import {
  InputField,
  SelectField,
} from '@shared/components/ui';

import { AnalyticsFilterPanel } from '../../../shared/components';

import type {
  SesionBiEstado,
  SesionesBiCatalogs,
  SesionesBiPeriodoPreset,
} from '../domain/sesionesBi.types';
import { getSesionBiStatusLabel } from '../utils/sesionesBi.utils';

interface SesionesBiFiltersProps {
  preset: SesionesBiPeriodoPreset;
  customFrom: string;
  customTo: string;
  reportId: number | null;
  userId: number | null;
  clientId: number | null;
  clientFilterDisabled: boolean;
  status: SesionBiEstado | null;
  catalogs: SesionesBiCatalogs | null;
  disabled?: boolean;
  onPresetChange: (value: SesionesBiPeriodoPreset) => void;
  onCustomRangeChange: (from: string, to: string) => void;
  onReportChange: (value: number | null) => void;
  onUserChange: (value: number | null) => void;
  onClientChange: (value: number | null) => void;
  onStatusChange: (value: SesionBiEstado | null) => void;
  onClear: () => void;
}

const toOptionalId = (value: string): number | null => {
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
};

const PERIOD_OPTIONS = [
  { id: 'TODAY', label: 'Hoy' },
  { id: 'YESTERDAY', label: 'Ayer' },
  { id: 'LAST_7_DAYS', label: 'Últimos 7 días' },
  { id: 'LAST_30_DAYS', label: 'Últimos 30 días' },
  { id: 'CUSTOM', label: 'Personalizado' },
] satisfies { id: SesionesBiPeriodoPreset; label: string }[];

export const SesionesBiFilters = ({
  preset,
  customFrom,
  customTo,
  reportId,
  userId,
  clientId,
  clientFilterDisabled,
  status,
  catalogs,
  disabled = false,
  onPresetChange,
  onCustomRangeChange,
  onReportChange,
  onUserChange,
  onClientChange,
  onStatusChange,
  onClear,
}: SesionesBiFiltersProps) => {
  return (
    <AnalyticsFilterPanel
      className="sessions-bi-filters"
      title="Filtros de trazabilidad"
      clearLabel="Limpiar"
      disabled={disabled}
      onClear={onClear}
    >
      <div className="analytics-filter-surface sessions-bi-filter-surface">
        <div className="sessions-bi-filters__row">
        <SelectField
          id="sessions-bi-period"
          label="Período"
          wrapperClassName="sessions-bi-filter"
          options={PERIOD_OPTIONS}
          value={preset}
          disabled={disabled}
          hidePlaceholder
          onChange={onPresetChange}
        />

        {preset === 'CUSTOM' && (
          <div className="sessions-bi-filter sessions-bi-filter--dates">
            <span className="form-label">Rango</span>
            <div className="sessions-bi-filter__dates">
              <InputField
                type="date"
                value={customFrom}
                disabled={disabled}
                aria-label="Fecha desde"
                wrapperClassName="sessions-bi-filter__date-field"
                onChange={(event) =>
                  onCustomRangeChange(event.target.value, customTo)
                }
              />
              <span aria-hidden="true">—</span>
              <InputField
                type="date"
                value={customTo}
                disabled={disabled}
                aria-label="Fecha hasta"
                wrapperClassName="sessions-bi-filter__date-field"
                onChange={(event) =>
                  onCustomRangeChange(customFrom, event.target.value)
                }
              />
            </div>
          </div>
        )}

        <SelectField
          id="sessions-bi-report"
          label="Reporte BI"
          wrapperClassName="sessions-bi-filter"
          options={(catalogs?.reports ?? []).map((option) => ({
            id: String(option.id),
            label: option.name,
          }))}
          value={reportId === null ? '' : String(reportId)}
          placeholder="Todos los reportes"
          disabled={disabled}
          onChange={(value) => onReportChange(toOptionalId(value))}
        />

        <SelectField
          id="sessions-bi-user"
          label="Usuario"
          wrapperClassName="sessions-bi-filter"
          options={(catalogs?.users ?? []).map((option) => ({
            id: String(option.id),
            label: option.name,
          }))}
          value={userId === null ? '' : String(userId)}
          placeholder="Todos los usuarios"
          disabled={disabled}
          onChange={(value) => onUserChange(toOptionalId(value))}
        />

        <SelectField
          id="sessions-bi-client"
          label="Cliente"
          wrapperClassName={`sessions-bi-filter${clientFilterDisabled ? ' is-disabled' : ''}`}
          options={clientFilterDisabled
            ? []
            : (catalogs?.clients ?? []).map((option) => ({
                id: String(option.id),
                label: option.name,
              }))}
          value={clientFilterDisabled || clientId === null ? '' : String(clientId)}
          placeholder={clientFilterDisabled
            ? 'No aplica para este reporte'
            : 'Todos los clientes'}
          disabled={disabled || clientFilterDisabled}
          ariaDescribedBy={clientFilterDisabled
            ? 'sessions-bi-client-filter-hint'
            : undefined}
          hint={clientFilterDisabled
            ? 'Este BI no utiliza contexto de cliente.'
            : undefined}
          hintId={clientFilterDisabled
            ? 'sessions-bi-client-filter-hint'
            : undefined}
          onChange={(value) => onClientChange(toOptionalId(value))}
        />

        <SelectField
          id="sessions-bi-status"
          label="Estado"
          wrapperClassName="sessions-bi-filter"
          options={(catalogs?.statuses ?? ['ACTIVA', 'PAUSADA', 'CERRADA', 'EXPIRADA']).map(
            (option) => ({ id: option, label: getSesionBiStatusLabel(option) })
          )}
          value={status ?? ''}
          placeholder="Todos los estados"
          disabled={disabled}
          onChange={(value) => onStatusChange(value ? value as SesionBiEstado : null)}
        />
        </div>
      </div>
    </AnalyticsFilterPanel>
  );
};
