import {
  useEffect,
} from 'react';

import type {
  SesionBiDetail,
} from '../domain/sesionesBi.types';
import {
  formatSesionesBiDateTime,
  formatSesionesBiDuration,
  getSesionBiEventLabel,
  getSesionBiStatusLabel,
} from '../utils/sesionesBi.utils';
import {
  CloseIcon,
  MonitorIcon,
} from './SesionesBiIcons';

interface SesionBiDetailDrawerProps {
  open: boolean;
  data: SesionBiDetail | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}

export const SesionBiDetailDrawer = ({
  open,
  data,
  loading,
  error,
  onClose,
}: SesionBiDetailDrawerProps) => {
  useEffect(() => {
    if (!open) {
      return;
    }

    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  const session = data?.session ?? null;

  return (
    <div className="sessions-bi-drawer-layer" role="presentation" onMouseDown={onClose}>
      <aside
        className="sessions-bi-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Detalle de sesión BI"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="sessions-bi-drawer__header">
          <div className="sessions-bi-drawer__title">
            <span className="sessions-bi-drawer__icon"><MonitorIcon size={20} /></span>
            <div>
              <span className="sessions-bi-eyebrow">Trazabilidad</span>
              <h2>Detalle de sesión</h2>
            </div>
          </div>
          <button
            type="button"
            className="sessions-bi-drawer__close"
            aria-label="Cerrar detalle"
            onClick={onClose}
          >
            <CloseIcon size={19} />
          </button>
        </header>

        <div className="sessions-bi-drawer__content">
          {loading && <div className="sessions-bi-drawer__state">Cargando trazabilidad...</div>}
          {error && <div className="sessions-bi-drawer__state sessions-bi-drawer__state--error">{error}</div>}

          {!loading && !error && session && data && (
            <>
              <section className="sessions-bi-drawer__hero">
                <div>
                  <strong>{session.userName}</strong>
                  <span>{session.userLogin}</span>
                </div>
                <span className={`sessions-bi-status sessions-bi-status--${session.status.toLowerCase()}`}>
                  <span className="sessions-bi-status__dot" aria-hidden="true" />
                  {getSesionBiStatusLabel(session.status)}
                </span>
                <dl>
                  <div>
                    <dt>Reporte BI</dt>
                    <dd>{session.reportName}</dd>
                  </div>
                  <div>
                    <dt>Cliente</dt>
                    <dd>{session.clientName ?? 'Sin cliente asociado'}</dd>
                  </div>
                </dl>
              </section>

              <section className="sessions-bi-drawer__metrics">
                <div>
                  <span>Tiempo visible</span>
                  <strong>{formatSesionesBiDuration(session.visibleSeconds)}</strong>
                </div>
                <div>
                  <span>Tiempo transcurrido</span>
                  <strong>{formatSesionesBiDuration(data.elapsedSeconds)}</strong>
                </div>
                <div>
                  <span>Fuera de vista aprox.</span>
                  <strong>{formatSesionesBiDuration(data.estimatedHiddenSeconds)}</strong>
                </div>
              </section>

              <section className="sessions-bi-drawer__facts">
                <div>
                  <span>Inicio</span>
                  <strong>{formatSesionesBiDateTime(session.startedAtUtc)}</strong>
                </div>
                <div>
                  <span>Fin</span>
                  <strong>{formatSesionesBiDateTime(session.endedAtUtc)}</strong>
                </div>
                <div>
                  <span>Última actividad</span>
                  <strong>{formatSesionesBiDateTime(session.lastHeartbeatAtUtc)}</strong>
                </div>
                {session.closeReason && (
                  <div>
                    <span>Motivo de cierre</span>
                    <strong>{session.closeReason}</strong>
                  </div>
                )}
              </section>

              <section className="sessions-bi-timeline">
                <div className="sessions-bi-timeline__heading">
                  <h3>Secuencia de actividad</h3>
                  <span>{data.events.length} eventos</span>
                </div>
                {data.events.length === 0 ? (
                  <div className="sessions-bi-empty">No hay eventos detallados para esta sesión.</div>
                ) : (
                  <ol>
                    {data.events.map((event) => (
                      <li key={event.eventId}>
                        <span className={`sessions-bi-timeline__marker sessions-bi-timeline__marker--${event.eventType.toLowerCase()}`} />
                        <div className="sessions-bi-timeline__event">
                          <div>
                            <strong>{getSesionBiEventLabel(event.eventType)}</strong>
                            <span>{formatSesionesBiDateTime(event.eventAtUtc)}</span>
                          </div>
                          <small>
                            Visible acumulado: {formatSesionesBiDuration(event.visibleSeconds)}
                            {event.detail ? ` · ${event.detail}` : ''}
                          </small>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </section>
            </>
          )}
        </div>
      </aside>
    </div>
  );
};
