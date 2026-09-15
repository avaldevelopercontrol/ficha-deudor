import type { ReactNode } from 'react';

import { ActionButton } from '@shared/components/ui';
import { SisgesIcon } from '@shared/icons/sisges';

import { AnalyticsPanel } from './AnalyticsPanel';

interface AnalyticsFilterPanelProps {
  children: ReactNode;
  onClear: () => void;
  disabled?: boolean;
  title?: string;
  clearLabel?: string;
  className?: string;
  bodyClassName?: string;
}

export const AnalyticsFilterPanel = ({
  children,
  onClear,
  disabled = false,
  title = 'Filtros operativos',
  clearLabel = 'Limpiar',
  className = '',
  bodyClassName = '',
}: AnalyticsFilterPanelProps) => (
  <AnalyticsPanel
    variant="integrated"
    className={`analytics-filter-panel ${className}`.trim()}
    headerClassName="analytics-filter-panel__header"
    iconClassName="analytics-heading-icon"
    icon={<SisgesIcon name="filter" />}
    title={title}
    actions={(
      <ActionButton
        label={clearLabel}
        variant="outline-danger"
        size="sm"
        disabled={disabled}
        onClick={onClear}
      />
    )}
  >
    <div className={`analytics-filter-panel__body ${bodyClassName}`.trim()}>
      {children}
    </div>
  </AnalyticsPanel>
);
