import SideDrawer from '@shared/components/modals/SideDrawer';
import {
  Badge,
  ResourceState,
} from '@shared/components/ui';
import { SisgesIcon } from '@shared/icons/sisges';

import type {
  SesionBiDetail,
  SesionBiEstado,
} from '../domain/sesionesBi.types';
import {
  formatSesionesBiDateTime,
  formatSesionesBiDuration,
  getSesionBiEventLabel,
  getSesionBiStatusLabel,
} from '../utils/sesionesBi.utils';

interface SesionBiDetailDrawerProps {
  open: boolean;
  data: SesionBiDetail | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onClose: () => void;
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

export const SesionBiDetailDrawer = ({
  open,
  data,
  loading,
  error,
  onRetry,
  onClose,
}: SesionBiDetailDrawerProps) => {
  const session = data?.session ?? null;

  return (
    <SideDrawer
      open={open}
      title="Detalle de sesión"
      eyebrow="Trazabilidad"
      icon={<SisgesIcon name="monitor" width={20} height={20} />}
      ariaLabel="Detalle de sesión BI"
      width="md"
      contentClassName="sessions-bi-drawer__content"
      onClose={onClose}
    >
      <ResourceState
        isLoading={loading}
        error={error}
        hasData={session !== null && data !== null}
        onRetry={onRetry}
        loadingMessage="Cargando trazabilidad..."
        errorTitle="No se pudo cargar el detalle de la sesión"
        emptyMessage="No hay detalle disponible para esta sesión."
        preserveDataOnError={false}
        preserveDataOnLoading={false}
        className="sessions-bi-drawer__resource-state"
      >
        {session && data && (
          <>
            <section className="sessions-bi-drawer__hero">
              <div>
                <strong>{session.userName}</strong>
                <span>{session.userLogin}</span>
              </div>
              <Badge
                variant={statusVariant(session.status)}
                size="sm"
                pill
                dot
                preserveCase
              >
                {getSesionBiStatusLabel(session.status)}
              </Badge>
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
                <div className="sessions-bi-empty">
                  No hay eventos detallados para esta sesión.
                </div>
              ) : (
                <ol>
                  {data.events.map((event) => (
                    <li key={event.eventId}>
                      <span
                        className={`sessions-bi-timeline__marker sessions-bi-timeline__marker--${event.eventType.toLowerCase()}`}
                      />
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
      </ResourceState>
    </SideDrawer>
  );
};
