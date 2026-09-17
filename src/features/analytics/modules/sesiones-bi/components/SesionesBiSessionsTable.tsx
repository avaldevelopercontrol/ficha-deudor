import {
  useMemo,
} from 'react';

import Table from '@shared/components/table/Table';
import {
  Badge,
  Paginacion,
  SelectField,
} from '@shared/components/ui';
import { useClientSideTable } from '@shared/hooks/useClientSideTable';
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
  order: SesionesBiOrden;
  loading?: boolean;
  onOrderChange: (order: SesionesBiOrden) => void;
  onSelect: (sessionId: string) => void;
}

interface SesionBiTableRow extends SesionBiRow {
  clientDisplayName: string;
  startedAtDisplay: string;
  lastActivityDisplay: string;
  visibleTimeDisplay: string;
  statusDisplay: string;
}

const PAGE_SIZE_OPTIONS = [5, 10, 15, 30] as const;

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

const COLUMNS: Column<SesionBiTableRow>[] = [
  {
    key: 'userName',
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
    key: 'reportName',
    label: 'Reporte BI',
    width: '22%',
    render: (session) => <strong>{session.reportName}</strong>,
  },
  {
    key: 'clientDisplayName',
    label: 'Cliente',
    width: '13%',
  },
  {
    key: 'startedAtDisplay',
    label: 'Inicio',
    width: '12%',
  },
  {
    key: 'lastActivityDisplay',
    label: 'Última actividad',
    width: '12%',
  },
  {
    key: 'visibleTimeDisplay',
    label: 'Tiempo visible',
    width: '10%',
    align: 'right',
    render: (session) => <strong>{session.visibleTimeDisplay}</strong>,
  },
  {
    key: 'statusDisplay',
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
        {session.statusDisplay}
      </Badge>
    ),
  },
  {
    key: 'detail',
    label: '',
    width: '4%',
    align: 'center',
    filterable: false,
    render: () => (
      <span className="sessions-bi-table__chevron" aria-hidden="true">
        <SisgesIcon name="chevron-right" width={16} height={16} />
      </span>
    ),
  },
];

const toTableRow = (session: SesionBiRow): SesionBiTableRow => ({
  ...session,
  clientDisplayName: session.clientName ?? 'Sin cliente asociado',
  startedAtDisplay: formatSesionesBiDateTime(session.startedAtUtc),
  lastActivityDisplay: formatSesionesBiDateTime(session.lastHeartbeatAtUtc),
  visibleTimeDisplay: formatSesionesBiDuration(session.visibleSeconds),
  statusDisplay: getSesionBiStatusLabel(session.status),
});

export const SesionesBiSessionsTable = ({
  sessions,
  order,
  loading = false,
  onOrderChange,
  onSelect,
}: SesionesBiSessionsTableProps) => {
  const allData = useMemo(
    () => sessions.map(toTableRow),
    [sessions]
  );
  const table = useClientSideTable(
    allData,
    [order],
    {
      initialPageSize: 10,
    }
  );
  const startIndex = (table.pageNumber - 1) * table.pageSize;
  const endIndex = Math.min(
    startIndex + table.pageSize,
    table.totalRecords
  );

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
          data={table.paginatedData}
          allData={allData}
          emptyMessage="No hay sesiones para los filtros seleccionados."
          enableColumnFilters
          textFilters={table.textFilters}
          selectedFilters={table.selectedFilters}
          onTextFilterChange={table.onTextFilterChange}
          onSelectedFilterChange={table.onSelectedFilterChange}
          fitToPanel
          ariaBusy={loading}
          wrapperClassName="sessions-bi-table-wrap"
          tableClassName="sessions-bi-table"
          getRowKey={(session) => session.sessionId}
          rowClassName={() => 'sessions-bi-table__row'}
          rowAriaLabel={(session) => `Ver detalle de la sesión de ${session.userName} en ${session.reportName}`}
          onRowClick={(session) => onSelect(session.sessionId)}
        />

        {table.totalRecords > 0 && (
          <div className="sessions-bi-table-pagination">
            <Paginacion
              paginaActual={table.pageNumber}
              totalPaginas={table.totalPages}
              totalRegistros={table.totalRecords}
              indiceInicio={startIndex}
              indiceFin={endIndex}
              disabled={loading}
              onPaginaAnterior={() =>
                table.setPageNumber(table.pageNumber - 1)
              }
              onPaginaSiguiente={() =>
                table.setPageNumber(table.pageNumber + 1)
              }
              onIrAPagina={table.setPageNumber}
              showPageSizeSelector
              pageSize={table.pageSize}
              pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
              onPageSizeChange={table.setPageSize}
            />
          </div>
        )}
      </div>
    </AnalyticsPanel>
  );
};
