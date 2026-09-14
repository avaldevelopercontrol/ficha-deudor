import {
  useCallback,
  useMemo,
  useState,
} from 'react';

import type {
  SesionBiEstado,
  SesionesBiOrden,
  SesionesBiPanelFilters,
  SesionesBiPeriodoPreset,
} from '../modules/sesiones-bi/domain/sesionesBi.types';
import { SesionBiDetailDrawer } from '../modules/sesiones-bi/components/SesionBiDetailDrawer';
import { SesionesBiFilters } from '../modules/sesiones-bi/components/SesionesBiFilters';
import { SesionesBiKpis } from '../modules/sesiones-bi/components/SesionesBiKpis';
import { RefreshIcon } from '../modules/sesiones-bi/components/SesionesBiIcons';
import { SesionesBiSessionsTable } from '../modules/sesiones-bi/components/SesionesBiSessionsTable';
import { SesionesBiTrend } from '../modules/sesiones-bi/components/SesionesBiTrend';
import { SesionesBiUsagePanels } from '../modules/sesiones-bi/components/SesionesBiUsagePanels';
import { useSesionBiDetail } from '../modules/sesiones-bi/hooks/useSesionBiDetail';
import { useSesionesBiPanel } from '../modules/sesiones-bi/hooks/useSesionesBiPanel';
import {
  getPeruCalendarDate,
  resolveSesionesBiPeriod,
} from '../modules/sesiones-bi/utils/sesionesBi.utils';

import '../styles/34-sesiones-bi.css';

const DEFAULT_PRESET: SesionesBiPeriodoPreset = 'LAST_7_DAYS';
const DEFAULT_PAGE_SIZE = 20;

const SesionesBiPage = () => {
  const today = useMemo(() => getPeruCalendarDate(), []);
  const [preset, setPreset] = useState<SesionesBiPeriodoPreset>(DEFAULT_PRESET);
  const [customFrom, setCustomFrom] = useState(today);
  const [customTo, setCustomTo] = useState(today);
  const [reportId, setReportId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [clientId, setClientId] = useState<number | null>(null);
  const [status, setStatus] = useState<SesionBiEstado | null>(null);
  const [search, setSearch] = useState('');
  const [searchDraft, setSearchDraft] = useState('');
  const [order, setOrder] = useState<SesionesBiOrden>('inicio_desc');
  const [page, setPage] = useState(1);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  const period = useMemo(
    () => resolveSesionesBiPeriod(preset, new Date(), customFrom, customTo),
    [customFrom, customTo, preset]
  );

  const filters = useMemo<SesionesBiPanelFilters>(
    () => ({
      fromUtc: period.fromUtc,
      toUtc: period.toUtc,
      reportId,
      userId,
      clientId,
      status,
      search,
      order,
      page,
      pageSize: DEFAULT_PAGE_SIZE,
    }),
    [clientId, order, page, period.fromUtc, period.toUtc, reportId, search, status, userId]
  );

  const {
    data,
    loading,
    error,
    refetch,
  } = useSesionesBiPanel(filters);

  const selectedReport = useMemo(
    () => data?.catalogs.reports.find((option) => option.id === reportId) ?? null,
    [data?.catalogs.reports, reportId]
  );
  const clientFilterDisabled =
    selectedReport !== null && !selectedReport.requiresClientSelection;

  const detail = useSesionBiDetail(selectedSessionId);

  const resetPage = useCallback(() => setPage(1), []);

  const handlePresetChange = (value: SesionesBiPeriodoPreset) => {
    setPreset(value);
    resetPage();
  };

  const handleCustomRangeChange = (from: string, to: string) => {
    if (!from || !to) {
      setCustomFrom(from || customFrom);
      setCustomTo(to || customTo);
      return;
    }

    if (from > to) {
      setCustomFrom(from);
      setCustomTo(from);
    } else {
      setCustomFrom(from);
      setCustomTo(to);
    }
    resetPage();
  };

  const clearFilters = () => {
    setPreset(DEFAULT_PRESET);
    setCustomFrom(today);
    setCustomTo(today);
    setReportId(null);
    setUserId(null);
    setClientId(null);
    setStatus(null);
    setSearch('');
    setSearchDraft('');
    setOrder('inicio_desc');
    setPage(1);
  };

  return (
    <main className="sessions-bi-page">
      <div className="sessions-bi-page__content">
        <header className="sessions-bi-page__hero">
          <div>
            <span className="sessions-bi-eyebrow">Gestión Analítica</span>
            <h1>Sesiones BI</h1>
            <p>
              Trazabilidad de acceso y tiempo visible en los reportes Power BI. Identifica adopción, usuarios activos y sesiones que requieren revisión.
            </p>
          </div>
          <div className="sessions-bi-page__hero-actions">
            {data && (
              <span className="sessions-bi-live-pill">
                <span aria-hidden="true" />
                {data.summary.activeSessions} activas ahora
              </span>
            )}
            <button
              type="button"
              className="sessions-bi-refresh"
              disabled={loading}
              onClick={refetch}
            >
              <RefreshIcon size={16} />
              Actualizar
            </button>
          </div>
        </header>

        <SesionesBiFilters
          preset={preset}
          customFrom={customFrom}
          customTo={customTo}
          reportId={reportId}
          userId={userId}
          clientId={clientId}
          clientFilterDisabled={clientFilterDisabled}
          status={status}
          searchDraft={searchDraft}
          catalogs={data?.catalogs ?? null}
          disabled={loading && data === null}
          onPresetChange={handlePresetChange}
          onCustomRangeChange={handleCustomRangeChange}
          onReportChange={(value) => {
            setReportId(value);
            setClientId(null);
            resetPage();
          }}
          onUserChange={(value) => {
            setUserId(value);
            resetPage();
          }}
          onClientChange={(value) => {
            setClientId(value);
            resetPage();
          }}
          onStatusChange={(value) => {
            setStatus(value);
            resetPage();
          }}
          onSearchDraftChange={setSearchDraft}
          onSearchSubmit={() => {
            setSearch(searchDraft.trim());
            resetPage();
          }}
          onClear={clearFilters}
        />

        {error && (
          <section className="sessions-bi-error" role="alert">
            <div>
              <strong>No se pudo cargar Sesiones BI</strong>
              <span>{error}</span>
            </div>
            <button type="button" onClick={refetch}>Reintentar</button>
          </section>
        )}

        {loading && !data && (
          <section className="sessions-bi-loading" role="status">
            <span className="sessions-bi-loading__pulse" />
            Cargando trazabilidad de reportes BI...
          </section>
        )}

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
              order={order}
              loading={loading}
              onOrderChange={(value) => {
                setOrder(value);
                setPage(1);
              }}
              onPageChange={setPage}
              onSelect={setSelectedSessionId}
            />
          </div>
        )}
      </div>

      <SesionBiDetailDrawer
        open={selectedSessionId !== null}
        data={detail.data}
        loading={detail.loading}
        error={detail.error}
        onClose={() => setSelectedSessionId(null)}
      />
    </main>
  );
};

export default SesionesBiPage;
