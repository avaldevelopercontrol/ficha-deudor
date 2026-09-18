import { SisgesIcon } from '@shared/icons/sisges';

import { AnalyticsKpiCard } from '../../../shared/components';
import type { SesionesBiSummary } from '../domain/sesionesBi.types';
import { formatSesionesBiDuration } from '../utils/sesionesBi.utils';

interface KpiDefinition {
  key: string;
  label: string;
  value: string;
  hint: string;
  icon: 'activity' | 'history' | 'users' | 'clock' | 'gauge';
  tone?: 'info' | 'violet' | 'success' | 'warning';
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
      icon: 'activity',
      tone: 'success',
    },
    {
      key: 'sessions',
      label: 'Sesiones',
      value: summary.totalSessions.toLocaleString('es-PE'),
      hint: 'Ingresos registrados en el período',
      icon: 'history',
      tone: 'info',
    },
    {
      key: 'users',
      label: 'Usuarios únicos',
      value: summary.uniqueUsers.toLocaleString('es-PE'),
      hint: 'Personas que consultaron al menos un BI',
      icon: 'users',
      tone: 'violet',
    },
    {
      key: 'time',
      label: 'Tiempo visible',
      value: formatSesionesBiDuration(summary.visibleSeconds),
      hint: 'Tiempo acumulado con el visor visible',
      icon: 'clock',
      tone: 'warning',
    },
    {
      key: 'average',
      label: 'Promedio / sesión',
      value: formatSesionesBiDuration(summary.averageSecondsPerSession),
      hint: 'Promedio de tiempo visible por ingreso',
      icon: 'gauge',
    },
  ];

  return (
    <section className="sessions-bi-kpis" aria-label="Resumen de uso BI">
      {cards.map((card) => (
        <AnalyticsKpiCard
          key={card.key}
          label={card.label}
          value={card.value}
          hint={card.hint}
          tone={card.tone}
          layout="stacked"
          icon={<SisgesIcon name={card.icon} width={20} height={20} />}
        />
      ))}
    </section>
  );
};
