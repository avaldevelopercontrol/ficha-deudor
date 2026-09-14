import type {
  SesionBiRow,
  SesionesBiOrden,
} from '../domain/sesionesBi.types';
import {
  formatSesionesBiDateTime,
  formatSesionesBiDuration,
  getSesionBiStatusLabel,
} from '../utils/sesionesBi.utils';
import { ChevronRightIcon } from './SesionesBiIcons';

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

const statusClass = (status: SesionBiRow['status']) =>
  `sessions-bi-status sessions-bi-status--${status.toLowerCase()}`;

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
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <section className="sessions-bi-panel sessions-bi-detail-panel">
      <header className="sessions-bi-panel__header sessions-bi-detail-panel__header">
        <div>
          <span className="sessions-bi-eyebrow">Trazabilidad</span>
          <h2>Detalle de sesiones</h2>
          <p>Selecciona una fila para revisar la secuencia de actividad.</p>
        </div>
        <label className="sessions-bi-table-order">
          <span>Ordenar por</span>
          <select
            value={order}
            disabled={loading}
            onChange={(event) => onOrderChange(event.target.value as SesionesBiOrden)}
          >
            <option value="inicio_desc">Más recientes</option>
            <option value="tiempo_desc">Mayor tiempo visible</option>
            <option value="usuario_asc">Usuario A–Z</option>
            <option value="reporte_asc">Reporte A–Z</option>
          </select>
        </label>
      </header>

      <div className="sessions-bi-table-wrap" aria-busy={loading}>
        <table className="sessions-bi-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Reporte BI</th>
              <th>Cliente</th>
              <th>Inicio</th>
              <th>Última actividad</th>
              <th className="sessions-bi-table__numeric">Tiempo visible</th>
              <th>Estado</th>
              <th aria-label="Detalle" />
            </tr>
          </thead>
          <tbody>
            {!loading && sessions.length === 0 && (
              <tr>
                <td colSpan={8} className="sessions-bi-table__empty">
                  No hay sesiones para los filtros seleccionados.
                </td>
              </tr>
            )}
            {sessions.map((session) => (
              <tr
                key={session.sessionId}
                className="sessions-bi-table__row"
                tabIndex={0}
                role="button"
                onClick={() => onSelect(session.sessionId)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect(session.sessionId);
                  }
                }}
              >
                <td>
                  <strong>{session.userName}</strong>
                  <span className="sessions-bi-table__subtext">{session.userLogin}</span>
                </td>
                <td>
                  <strong>{session.reportName}</strong>
                </td>
                <td>{session.clientName ?? 'Sin cliente asociado'}</td>
                <td>{formatSesionesBiDateTime(session.startedAtUtc)}</td>
                <td>{formatSesionesBiDateTime(session.lastHeartbeatAtUtc)}</td>
                <td className="sessions-bi-table__numeric">
                  <strong>{formatSesionesBiDuration(session.visibleSeconds)}</strong>
                </td>
                <td>
                  <span className={statusClass(session.status)}>
                    <span className="sessions-bi-status__dot" aria-hidden="true" />
                    {getSesionBiStatusLabel(session.status)}
                  </span>
                </td>
                <td className="sessions-bi-table__chevron">
                  <ChevronRightIcon size={16} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="sessions-bi-pagination">
        <span>
          {from.toLocaleString('es-PE')}–{to.toLocaleString('es-PE')} de {total.toLocaleString('es-PE')} sesiones
        </span>
        <div>
          <button
            type="button"
            disabled={loading || page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Anterior
          </button>
          <span>Página {page} de {totalPages}</span>
          <button
            type="button"
            disabled={loading || page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Siguiente
          </button>
        </div>
      </footer>
    </section>
  );
};
