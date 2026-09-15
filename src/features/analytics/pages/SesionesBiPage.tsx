import {
  useState,
} from 'react';

import {
  ActionButton,
  ResourceState,
} from '@shared/components/ui';
import { SisgesIcon } from '@shared/icons/sisges';

import { AnalyticsPageHeader } from '../shared/components';
import { SesionBiDetailDrawer } from '../modules/sesiones-bi/components/SesionBiDetailDrawer';
import { SesionesBiFilters } from '../modules/sesiones-bi/components/SesionesBiFilters';
import { SesionesBiKpis } from '../modules/sesiones-bi/components/SesionesBiKpis';
import { SesionesBiSessionsTable } from '../modules/sesiones-bi/components/SesionesBiSessionsTable';
import { SesionesBiTrend } from '../modules/sesiones-bi/components/SesionesBiTrend';
import { SesionesBiUsagePanels } from '../modules/sesiones-bi/components/SesionesBiUsagePanels';
import { useSesionBiDetail } from '../modules/sesiones-bi/hooks/useSesionBiDetail';
import { useSesionesBiFiltersController } from '../modules/sesiones-bi/hooks/useSesionesBiFiltersController';
import { useSesionesBiPanel } from '../modules/sesiones-bi/hooks/useSesionesBiPanel';

import '../styles/34-sesiones-bi.css';

const SesionesBiPage = () => {
  const filters = useSesionesBiFiltersController();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const {
    data,
    loading,
    error,
    refetch,
  } = useSesionesBiPanel(filters.panelFilters);
  const detail = useSesionBiDetail(selectedSessionId);
  const catalogs = data?.catalogs ?? null;
  const clientFilterDisabled =
    filters.isClientFilterDisabled(catalogs);

  return (
    <main className="sessions-bi-page">
      <div className="sessions-bi-page__content">
        <AnalyticsPageHeader
          variant="hero"
          className="sessions-bi-page__header"
          icon={<SisgesIcon name="analytics" />}
          title="Sesiones BI"
          description="Trazabilidad de acceso y tiempo visible en los reportes Power BI. Identifica adopción, usuarios activos y sesiones que requieren revisión."
          actions={(
            <>
              {data && (
                <span className="sessions-bi-live-pill">
                  <span aria-hidden="true" />
                  {data.summary.activeSessions} activas ahora
                </span>
              )}
              <ActionButton
                label="Actualizar"
                variant="secondary"
                size="sm"
                disabled={loading}
                className="sessions-bi-refresh"
                icon={<SisgesIcon name="refresh" width={16} height={16} />}
                onClick={refetch}
              />
            </>
          )}
        />

        <SesionesBiFilters
          preset={filters.state.preset}
          customFrom={filters.state.customFrom}
          customTo={filters.state.customTo}
          reportId={filters.state.reportId}
          userId={filters.state.userId}
          clientId={filters.state.clientId}
          clientFilterDisabled={clientFilterDisabled}
          status={filters.state.status}
          catalogs={catalogs}
          disabled={loading && data === null}
          onPresetChange={filters.setPreset}
          onCustomRangeChange={filters.setCustomRange}
          onReportChange={filters.setReportId}
          onUserChange={filters.setUserId}
          onClientChange={filters.setClientId}
          onStatusChange={filters.setStatus}
          onClear={filters.clearFilters}
        />

        <ResourceState
          isLoading={loading}
          error={error}
          hasData={data !== null}
          onRetry={refetch}
          loadingMessage="Cargando trazabilidad de reportes BI..."
          errorTitle="No se pudo cargar Sesiones BI"
        >
          {data && (
            <div className={loading ? 'sessions-bi-page__data is-refreshing' : 'sessions-bi-page__data'}>
              <SesionesBiKpis summary={data.summary} />

              <SesionesBiUsagePanels
                reports={data.reportUsage}
                users={data.topUsers}
              />

              <SesionesBiTrend
                points={data.trend}
                granularity={data.trendGranularity}
              />

              <SesionesBiSessionsTable
                sessions={data.sessions.items}
                total={data.sessions.total}
                page={data.sessions.page}
                pageSize={data.sessions.pageSize}
                order={filters.state.order}
                loading={loading}
                onOrderChange={filters.setOrder}
                onPageChange={filters.setPage}
                onSelect={setSelectedSessionId}
              />
            </div>
          )}
        </ResourceState>
      </div>

      <SesionBiDetailDrawer
        open={selectedSessionId !== null}
        data={detail.data}
        loading={detail.loading}
        error={detail.error}
        onRetry={detail.refetch}
        onClose={() => setSelectedSessionId(null)}
      />
    </main>
  );
};

export default SesionesBiPage;
