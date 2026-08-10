import {
  useCallback,
  useMemo,
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
  prepareGestionDeudorSearch,
  type GestionDeudorSearchRequest,
} from '../../../utils/gestionDeudorSearch.utils';

interface GestionDeudorClientScope {
  idCliente: string;
}

interface ActiveGestionDeudorSearchRequest
  extends GestionDeudorSearchRequest {
  clientScope: GestionDeudorClientScope;
}

interface GestionDeudorValidationError {
  clientScope: GestionDeudorClientScope;
  message: string;
}

export interface UseGestionDeudorSearchReturn {
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
    useState<
      ActiveGestionDeudorSearchRequest | null
    >(null);
  const [validationError, setValidationError] =
    useState<GestionDeudorValidationError | null>(
      null
    );
  const requestIdRef = useRef(0);

  const currentClientId = String(
    idCliente ?? ''
  );
  const clientScope = useMemo(
    () => ({ idCliente: currentClientId }),
    [currentClientId]
  );
  const isCurrentRequest =
    activeRequest?.clientScope === clientScope;

  const loadDeudores = useCallback(
    (signal: AbortSignal) => {
      if (!activeRequest) {
        return Promise.resolve<
          DeudorGestionDeudor[]
        >([]);
      }

      return fetchDeudoresGestionDeudor(
        activeRequest.apiParams,
        signal
      );
    },
    [activeRequest]
  );

  const resource =
    useAsyncResource<DeudorGestionDeudor[]>({
      loader: loadDeudores,
      resourceKey: [
        activeRequest?.requestId,
        activeRequest?.apiParams.nIdCliente,
        activeRequest?.apiParams.busqueda,
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

  const data = isCurrentRequest
    ? resourceData
    : [];
  const isLoading = isCurrentRequest
    ? resourceLoading
    : false;
  const currentValidationError =
    validationError?.clientScope === clientScope
      ? validationError.message
      : null;
  const requestError = isCurrentRequest
    ? resourceError
    : null;

  const buscar = useCallback(() => {
    requestIdRef.current += 1;

    const preparedSearch =
      prepareGestionDeudorSearch({
        idCliente,
        tipoBusqueda,
        valorBusqueda,
        requestId: requestIdRef.current,
      });

    setRequestError(null);

    if (preparedSearch.status === 'invalid') {
      cancelRequest();
      setActiveRequest(null);
      setData([]);
      setValidationError({
        clientScope,
        message: preparedSearch.message,
      });
      return;
    }

    setValidationError(null);
    setActiveRequest({
      ...preparedSearch.request,
      clientScope,
    });
  }, [
    cancelRequest,
    clientScope,
    idCliente,
    setData,
    setRequestError,
    tipoBusqueda,
    valorBusqueda,
  ]);

  const limpiar = useCallback(() => {
    requestIdRef.current += 1;
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
    error:
      currentValidationError ?? requestError,
    buscar,
    limpiar,
  };
}
