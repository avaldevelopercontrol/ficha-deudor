import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  useAsyncResource,
} from '@shared/hooks/useAsyncResource';

import {
  fetchDeudoresGestionDeudor,
} from '../../../api/deudoresGestionDeudorApi';
import type {
  DeudorGestionDeudor,
  TipoBusquedaGestionDeudor,
} from '../../../types/gestionDeudor.types';
import {
  normalizeGestionDeudorClientId,
  prepareGestionDeudorSearch,
  type GestionDeudorSearchRequest,
} from '../../../utils/gestionDeudorSearch.utils';

interface UseGestionDeudorSearchReturn {
  tipoBusqueda: TipoBusquedaGestionDeudor;
  valorBusqueda: string;
  setTipoBusqueda: (
    value: TipoBusquedaGestionDeudor
  ) => void;
  setValorBusqueda: (value: string) => void;
  data: DeudorGestionDeudor[];
  isLoading: boolean;
  error: string | null;
  buscar: () => void;
  limpiar: () => void;
}

export function useGestionDeudorSearch(
  idCliente?: string | null
): UseGestionDeudorSearchReturn {
  const [tipoBusqueda, setTipoBusqueda] =
    useState<TipoBusquedaGestionDeudor>('R');
  const [valorBusqueda, setValorBusqueda] =
    useState('');
  const [activeRequest, setActiveRequest] =
    useState<GestionDeudorSearchRequest | null>(
      null
    );
  const [validationError, setValidationError] =
    useState<string | null>(null);
  const requestIdRef = useRef(0);
  const inFlightRequestIdRef = useRef<
    number | null
  >(null);

  const currentClientId =
    normalizeGestionDeudorClientId(idCliente);
  const currentClientContextKey =
    currentClientId ??
    `invalid:${String(idCliente ?? '').trim()}`;
  const previousClientContextKeyRef = useRef(
    currentClientContextKey
  );
  const isCurrentRequest =
    currentClientId !== null &&
    activeRequest?.requestParams.idCliente ===
      currentClientId;

  const loadDeudores = useCallback(
    async (signal: AbortSignal) => {
      if (!activeRequest) {
        return [];
      }

      const requestId = activeRequest.requestId;

      try {
        return await fetchDeudoresGestionDeudor(
          activeRequest.requestParams,
          signal
        );
      } finally {
        if (
          inFlightRequestIdRef.current ===
          requestId
        ) {
          inFlightRequestIdRef.current = null;
        }
      }
    },
    [activeRequest]
  );

  const resource =
    useAsyncResource<DeudorGestionDeudor[]>({
      loader: loadDeudores,
      resourceKey: [
        activeRequest?.requestId,
        activeRequest?.requestParams.idCliente,
        activeRequest?.requestParams.busqueda,
      ],
      initialData: [],
      errorMessage: 'Error al buscar deudores.',
      enabled: isCurrentRequest,
      initialLoading: false,
      disabledError: null,
      clearDataOnError: true,
      resetDataWhenDisabled: true,
    });

  const {
    data: resourceData,
    isLoading: resourceLoading,
    error: resourceError,
    cancel: cancelRequest,
    setData,
    setError: setRequestError,
  } = resource;

  useEffect(() => {
    if (
      previousClientContextKeyRef.current ===
      currentClientContextKey
    ) {
      return;
    }

    previousClientContextKeyRef.current =
      currentClientContextKey;
    requestIdRef.current += 1;
    inFlightRequestIdRef.current = null;
    cancelRequest();
    setActiveRequest(null);
    setData([]);
    setRequestError(null);
    setValidationError(null);
  }, [
    cancelRequest,
    currentClientContextKey,
    setData,
    setRequestError,
  ]);

  const data = isCurrentRequest
    ? resourceData
    : [];
  const isLoading = isCurrentRequest
    ? resourceLoading
    : false;
  const requestError = isCurrentRequest
    ? resourceError
    : null;

  const buscar = useCallback(() => {
    if (inFlightRequestIdRef.current !== null) {
      return;
    }

    const requestId = ++requestIdRef.current;
    const preparedSearch =
      prepareGestionDeudorSearch({
        idCliente,
        tipoBusqueda,
        valorBusqueda,
        requestId,
      });

    setRequestError(null);

    if (preparedSearch.status === 'invalid') {
      cancelRequest();
      setActiveRequest(null);
      setData([]);
      setValidationError(preparedSearch.message);
      return;
    }

    inFlightRequestIdRef.current = requestId;
    setData([]);
    setValidationError(null);
    setActiveRequest(preparedSearch.request);
  }, [
    cancelRequest,
    idCliente,
    setData,
    setRequestError,
    tipoBusqueda,
    valorBusqueda,
  ]);

  const limpiar = useCallback(() => {
    requestIdRef.current += 1;
    inFlightRequestIdRef.current = null;
    cancelRequest();
    setActiveRequest(null);
    setValorBusqueda('');
    setData([]);
    setRequestError(null);
    setValidationError(null);
  }, [
    cancelRequest,
    setData,
    setRequestError,
  ]);

  return {
    tipoBusqueda,
    valorBusqueda,
    setTipoBusqueda,
    setValorBusqueda,
    data,
    isLoading,
    error: validationError ?? requestError,
    buscar,
    limpiar,
  };
}
