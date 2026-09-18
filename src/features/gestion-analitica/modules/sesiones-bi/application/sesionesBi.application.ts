import {
  fetchSesionBiDetail,
  fetchSesionesBiPanel,
} from '../api/sesionesBiApi';
import type {
  SesionBiDetail,
  SesionBiRow,
  SesionesBiPanel,
  SesionesBiPanelFilters,
} from '../domain/sesionesBi.types';

const SESIONES_BI_TABLE_FETCH_PAGE_SIZE = 100;
const SESIONES_BI_TABLE_FETCH_CONCURRENCY = 4;

export const getSesionesBiPanelResourceKey = (
  filters: SesionesBiPanelFilters
) => [
  filters.fromUtc,
  filters.toUtc,
  filters.reportId,
  filters.userId,
  filters.clientId,
  filters.status,
  filters.order,
  filters.page,
  filters.pageSize,
] as const;

export const getSesionBiDetailResourceKey = (
  sessionId: string | null
) => [sessionId] as const;

const createTablePageFilters = (
  filters: SesionesBiPanelFilters,
  page: number,
  pageSize: number
): SesionesBiPanelFilters => ({
  ...filters,
  page,
  pageSize,
});

const loadRemainingSessionRows = async (
  filters: SesionesBiPanelFilters,
  firstPageSize: number,
  totalPages: number,
  signal: AbortSignal
): Promise<SesionBiRow[]> => {
  const rows: SesionBiRow[] = [];

  for (
    let firstPage = 2;
    firstPage <= totalPages;
    firstPage += SESIONES_BI_TABLE_FETCH_CONCURRENCY
  ) {
    const lastPage = Math.min(
      totalPages,
      firstPage + SESIONES_BI_TABLE_FETCH_CONCURRENCY - 1
    );
    const pageNumbers = Array.from(
      { length: lastPage - firstPage + 1 },
      (_, index) => firstPage + index
    );
    const panels = await Promise.all(
      pageNumbers.map((page) =>
        fetchSesionesBiPanel(
          createTablePageFilters(filters, page, firstPageSize),
          signal
        )
      )
    );

    panels.forEach((panel) => {
      rows.push(...panel.sessions.items);
    });
  }

  return rows;
};

export const loadSesionesBiPanel = async (
  filters: SesionesBiPanelFilters,
  signal: AbortSignal
): Promise<SesionesBiPanel> => {
  const firstPanel = await fetchSesionesBiPanel(
    createTablePageFilters(
      filters,
      1,
      SESIONES_BI_TABLE_FETCH_PAGE_SIZE
    ),
    signal
  );
  const effectivePageSize = Math.max(
    1,
    firstPanel.sessions.pageSize
  );
  const totalPages = Math.max(
    1,
    Math.ceil(firstPanel.sessions.total / effectivePageSize)
  );

  if (totalPages === 1) {
    return {
      ...firstPanel,
      sessions: {
        ...firstPanel.sessions,
        page: 1,
      },
    };
  }

  const remainingRows = await loadRemainingSessionRows(
    filters,
    effectivePageSize,
    totalPages,
    signal
  );
  const allRows = [
    ...firstPanel.sessions.items,
    ...remainingRows,
  ];

  return {
    ...firstPanel,
    sessions: {
      page: 1,
      pageSize: Math.max(1, allRows.length),
      total: allRows.length,
      items: allRows,
    },
  };
};

export const loadSesionBiDetail = (
  sessionId: string,
  signal: AbortSignal
): Promise<SesionBiDetail> =>
  fetchSesionBiDetail(sessionId, signal);
