import {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  changeSesionesBiClient,
  changeSesionesBiCustomRange,
  changeSesionesBiOrder,
  changeSesionesBiPage,
  changeSesionesBiPreset,
  changeSesionesBiReport,
  changeSesionesBiStatus,
  changeSesionesBiUser,
  clearSesionesBiFilters,
  createSesionesBiFiltersState,
  isSesionesBiClientFilterDisabled,
  resolveSesionesBiPanelFilters,
} from '../application/sesionesBiFilters.application';
import type {
  SesionBiEstado,
  SesionesBiCatalogs,
  SesionesBiOrden,
  SesionesBiPeriodoPreset,
} from '../domain/sesionesBi.types';
import {
  getPeruCalendarDate,
} from '../utils/sesionesBi.utils';

export const useSesionesBiFiltersController = () => {
  const today = useMemo(() => getPeruCalendarDate(), []);
  const [state, setState] = useState(() =>
    createSesionesBiFiltersState(today)
  );

  const panelFilters = useMemo(
    () => resolveSesionesBiPanelFilters(state),
    [state]
  );

  const setPreset = useCallback(
    (value: SesionesBiPeriodoPreset) => {
      setState((current) =>
        changeSesionesBiPreset(current, value)
      );
    },
    []
  );

  const setCustomRange = useCallback(
    (from: string, to: string) => {
      setState((current) =>
        changeSesionesBiCustomRange(current, from, to)
      );
    },
    []
  );

  const setReportId = useCallback((value: number | null) => {
    setState((current) =>
      changeSesionesBiReport(current, value)
    );
  }, []);

  const setUserId = useCallback((value: number | null) => {
    setState((current) =>
      changeSesionesBiUser(current, value)
    );
  }, []);

  const setClientId = useCallback((value: number | null) => {
    setState((current) =>
      changeSesionesBiClient(current, value)
    );
  }, []);

  const setStatus = useCallback((value: SesionBiEstado | null) => {
    setState((current) =>
      changeSesionesBiStatus(current, value)
    );
  }, []);

  const setOrder = useCallback((value: SesionesBiOrden) => {
    setState((current) =>
      changeSesionesBiOrder(current, value)
    );
  }, []);

  const setPage = useCallback((value: number) => {
    setState((current) =>
      changeSesionesBiPage(current, value)
    );
  }, []);

  const clearFilters = useCallback(() => {
    setState(clearSesionesBiFilters(today));
  }, [today]);

  const isClientFilterDisabled = useCallback(
    (catalogs: SesionesBiCatalogs | null) =>
      isSesionesBiClientFilterDisabled(catalogs, state.reportId),
    [state.reportId]
  );

  return {
    state,
    panelFilters,
    setPreset,
    setCustomRange,
    setReportId,
    setUserId,
    setClientId,
    setStatus,
    setOrder,
    setPage,
    clearFilters,
    isClientFilterDisabled,
  };
};
