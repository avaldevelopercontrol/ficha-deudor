import type {
  SesionBiEstado,
  SesionesBiCatalogs,
  SesionesBiOrden,
  SesionesBiPanelFilters,
  SesionesBiPeriodoPreset,
} from '../domain/sesionesBi.types';
import {
  getPeruCalendarDate,
  resolveSesionesBiPeriod,
} from '../utils/sesionesBi.utils';

export const DEFAULT_SESIONES_BI_PRESET: SesionesBiPeriodoPreset =
  'LAST_7_DAYS';
export const DEFAULT_SESIONES_BI_PAGE_SIZE = 10;

export interface SesionesBiFiltersState {
  preset: SesionesBiPeriodoPreset;
  customFrom: string;
  customTo: string;
  reportId: number | null;
  userId: number | null;
  clientId: number | null;
  status: SesionBiEstado | null;
  order: SesionesBiOrden;
  page: number;
  pageSize: number;
}

const resetPage = (
  state: SesionesBiFiltersState
): SesionesBiFiltersState => ({
  ...state,
  page: 1,
});

export const createSesionesBiFiltersState = (
  today = getPeruCalendarDate()
): SesionesBiFiltersState => ({
  preset: DEFAULT_SESIONES_BI_PRESET,
  customFrom: today,
  customTo: today,
  reportId: null,
  userId: null,
  clientId: null,
  status: null,
  order: 'inicio_desc',
  page: 1,
  pageSize: DEFAULT_SESIONES_BI_PAGE_SIZE,
});

export const changeSesionesBiPreset = (
  state: SesionesBiFiltersState,
  preset: SesionesBiPeriodoPreset
): SesionesBiFiltersState =>
  resetPage({
    ...state,
    preset,
  });

export const changeSesionesBiCustomRange = (
  state: SesionesBiFiltersState,
  from: string,
  to: string
): SesionesBiFiltersState => {
  if (!from || !to) {
    return {
      ...state,
      customFrom: from || state.customFrom,
      customTo: to || state.customTo,
    };
  }

  return resetPage({
    ...state,
    customFrom: from,
    customTo: from > to ? from : to,
  });
};

export const changeSesionesBiReport = (
  state: SesionesBiFiltersState,
  reportId: number | null
): SesionesBiFiltersState =>
  resetPage({
    ...state,
    reportId,
    clientId: null,
  });

export const changeSesionesBiUser = (
  state: SesionesBiFiltersState,
  userId: number | null
): SesionesBiFiltersState =>
  resetPage({
    ...state,
    userId,
  });

export const changeSesionesBiClient = (
  state: SesionesBiFiltersState,
  clientId: number | null
): SesionesBiFiltersState =>
  resetPage({
    ...state,
    clientId,
  });

export const changeSesionesBiStatus = (
  state: SesionesBiFiltersState,
  status: SesionBiEstado | null
): SesionesBiFiltersState =>
  resetPage({
    ...state,
    status,
  });

export const changeSesionesBiOrder = (
  state: SesionesBiFiltersState,
  order: SesionesBiOrden
): SesionesBiFiltersState =>
  resetPage({
    ...state,
    order,
  });

export const changeSesionesBiPage = (
  state: SesionesBiFiltersState,
  page: number
): SesionesBiFiltersState => ({
  ...state,
  page,
});

export const clearSesionesBiFilters = (
  today: string
): SesionesBiFiltersState =>
  createSesionesBiFiltersState(today);

export const resolveSesionesBiPanelFilters = (
  state: SesionesBiFiltersState,
  currentDate = new Date()
): SesionesBiPanelFilters => {
  const period = resolveSesionesBiPeriod(
    state.preset,
    currentDate,
    state.customFrom,
    state.customTo
  );

  return {
    fromUtc: period.fromUtc,
    toUtc: period.toUtc,
    reportId: state.reportId,
    userId: state.userId,
    clientId: state.clientId,
    status: state.status,
    order: state.order,
    page: state.page,
    pageSize: state.pageSize,
  };
};

export const isSesionesBiClientFilterDisabled = (
  catalogs: SesionesBiCatalogs | null,
  reportId: number | null
): boolean => {
  if (reportId === null) {
    return false;
  }

  const selectedReport = catalogs?.reports.find(
    (option) => option.id === reportId
  );

  return selectedReport !== undefined &&
    !selectedReport.requiresClientSelection;
};
