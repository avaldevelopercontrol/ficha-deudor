import type { ReactNode } from 'react';

import type { SesionesBiSummary } from '../domain/sesionesBi.types';
import { formatSesionesBiDuration } from '../utils/sesionesBi.utils';
import {
  ActivityIcon,
  ClockIcon,
  GaugeIcon,
  SessionsIcon,
  UsersIcon,
} from './SesionesBiIcons';

interface KpiDefinition {
  key: string;
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
  emphasis?: 'live';
}

export const SesionesBiKpis = ({
  summary,
}: {
  summary: SesionesBiSummary;
}) => {
  const cards: KpiDefinition[] = [
    {
      key: 'active',
      label: 'Activas ahora',
      value: String(summary.activeSessions),
      hint: 'Visores BI con actividad reciente',
      icon: <ActivityIcon />,
      emphasis: 'live',
    },
    {
      key: 'sessions',
      label: 'Sesiones',
      value: summary.totalSessions.toLocaleString('es-PE'),
      hint: 'Ingresos registrados en el período',
      icon: <SessionsIcon />,
    },
    {
      key: 'users',
      label: 'Usuarios únicos',
      value: summary.uniqueUsers.toLocaleString('es-PE'),
      hint: 'Personas que consultaron al menos un BI',
      icon: <UsersIcon />,
    },
    {
      key: 'time',
      label: 'Tiempo visible',
      value: formatSesionesBiDuration(summary.visibleSeconds),
      hint: 'Tiempo acumulado con el visor visible',
      icon: <ClockIcon />,
    },
    {
      key: 'average',
      label: 'Promedio / sesión',
      value: formatSesionesBiDuration(summary.averageSecondsPerSession),
      hint: 'Promedio de tiempo visible por ingreso',
      icon: <GaugeIcon />,
    },
  ];

  return (
    <section className="sessions-bi-kpis" aria-label="Resumen de uso BI">
      {cards.map((card) => (
        <article
          key={card.key}
          className={`sessions-bi-kpi${card.emphasis === 'live' ? ' sessions-bi-kpi--live' : ''}`}
        >
          <div className="sessions-bi-kpi__icon">{card.icon}</div>
          <div className="sessions-bi-kpi__body">
            <span className="sessions-bi-kpi__label">{card.label}</span>
            <strong className="sessions-bi-kpi__value">{card.value}</strong>
            <span className="sessions-bi-kpi__hint">{card.hint}</span>
          </div>
        </article>
      ))}
    </section>
  );
};
