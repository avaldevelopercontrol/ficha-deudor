import Table from '@shared/components/table/Table';
import {
  Badge,
  Paginacion,
  SelectField,
} from '@shared/components/ui';
import { SisgesIcon } from '@shared/icons/sisges';
import type { Column } from '@shared/types';

import { AnalyticsPanel } from '../../../shared/components';
import type {
  SesionBiEstado,
  SesionBiRow,
  SesionesBiOrden,
} from '../domain/sesionesBi.types';
import {
  formatSesionesBiDateTime,
  formatSesionesBiDuration,
  getSesionBiStatusLabel,
} from '../utils/sesionesBi.utils';

interface SesionesBiSessionsTableProps {
  sessions: readonly SesionBiRow[];
  total: number;
  page: number;
  pageSize: number;
  order: SesionesBiOrden;
  loading?: boolean;
  onOrderChange: (order: SesionesBiOrden) => void;
  onPageChange: (page: number) => void;
  onSelect: (sessionId: string) => void;
}

const statusVariant = (
  status: SesionBiEstado
): 'success' | 'warning' | 'danger' | 'neutral' => {
  switch (status) {
    case 'ACTIVA':
      return 'success';
    case 'PAUSADA':
      return 'warning';
    case 'EXPIRADA':
      return 'danger';
    default:
      return 'neutral';
  }
};

const ORDER_OPTIONS = [
  { id: 'inicio_desc', label: 'Más recientes' },
  { id: 'tiempo_desc', label: 'Mayor tiempo visible' },
  { id: 'usuario_asc', label: 'Usuario A–Z' },
  { id: 'reporte_asc', label: 'Reporte A–Z' },
] satisfies { id: SesionesBiOrden; label: string }[];

const COLUMNS: Column<SesionBiRow>[] = [
  {
    key: 'user',
    label: 'Usuario',
    width: '17%',
    render: (session) => (
      <>
        <strong>{session.userName}</strong>
        <span className="sessions-bi-table__subtext">{session.userLogin}</span>
      </>
    ),
  },
  {
    key: 'report',
    label: 'Reporte BI',
    width: '22%',
    render: (session) => <strong>{session.reportName}</strong>,
  },
  {
    key: 'client',
    label: 'Cliente',
    width: '13%',
    render: (session) => session.clientName ?? 'Sin cliente asociado',
  },
  {
    key: 'startedAtUtc',
    label: 'Inicio',
    width: '12%',
    render: (session) => formatSesionesBiDateTime(session.startedAtUtc),
  },
  {
    key: 'lastHeartbeatAtUtc',
    label: 'Última actividad',
    width: '12%',
    render: (session) => formatSesionesBiDateTime(session.lastHeartbeatAtUtc),
  },
  {
    key: 'visibleSeconds',
    label: 'Tiempo visible',
    width: '10%',
    align: 'right',
    render: (session) => <strong>{formatSesionesBiDuration(session.visibleSeconds)}</strong>,
  },
  {
    key: 'status',
    label: 'Estado',
    width: '10%',
    render: (session) => (
      <Badge
        variant={statusVariant(session.status)}
        size="sm"
        pill
        dot
        preserveCase
      >
        {getSesionBiStatusLabel(session.status)}
      </Badge>
    ),
  },
  {
    key: 'detail',
    label: '',
    width: '4%',
    align: 'center',
    render: () => (
      <span className="sessions-bi-table__chevron" aria-hidden="true">
        <SisgesIcon name="chevron-right" width={16} height={16} />
      </span>
    ),
  },
];

export const SesionesBiSessionsTable = ({
  sessions,
  total,
  page,
  pageSize,
  order,
  loading = false,
  onOrderChange,
  onPageChange,
  onSelect,
}: SesionesBiSessionsTableProps) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(page * pageSize, total);

  return (
    <AnalyticsPanel
      variant="integrated"
      className="analytics-data-panel sessions-bi-detail-panel"
      headerClassName="analytics-data-panel__header sessions-bi-detail-panel__header"
      iconClassName="analytics-heading-icon"
      icon={<SisgesIcon name="audit" />}
      eyebrow="Trazabilidad"
      title="Detalle de sesiones"
      description="Selecciona una fila para revisar la secuencia de actividad."
      actions={(
        <div className="sessions-bi-table-order">
          <SelectField
            id="sessions-bi-order"
            label="Ordenar por"
            layout="inline"
            options={ORDER_OPTIONS}
            value={order}
            disabled={loading}
            hidePlaceholder
            onChange={onOrderChange}
          />
        </div>
      )}
    >
      <div className="analytics-table-surface sessions-bi-table-surface">
        <Table
          columns={COLUMNS}
          data={[...sessions]}
          emptyMessage="No hay sesiones para los filtros seleccionados."
          fitToPanel={false}
          appearance="analytics"
          ariaBusy={loading}
          wrapperClassName="sessions-bi-table-wrap"
          tableClassName="sessions-bi-table"
          getRowKey={(session) => session.sessionId}
          rowClassName={() => 'sessions-bi-table__row'}
          rowAriaLabel={(session) => `Ver detalle de la sesión de ${session.userName} en ${session.reportName}`}
          onRowClick={(session) => onSelect(session.sessionId)}
        />

        <Paginacion
          variant="compact"
          paginaActual={page}
          totalPaginas={totalPages}
          totalRegistros={total}
          indiceInicio={startIndex}
          indiceFin={endIndex}
          disabled={loading}
          summaryNoun="sesiones"
          onPaginaAnterior={() => onPageChange(page - 1)}
          onPaginaSiguiente={() => onPageChange(page + 1)}
          onIrAPagina={onPageChange}
        />
      </div>
    </AnalyticsPanel>
  );
};
