import {
  useGestionEstados,
  useGestionTipos,
  useGestionPaletaRespuesta,
  useGestionEstadoGestionClaro,
  useGestionMotivoNoPago,
} from './useFichaGestion';

import { TIPO_GESTION_PALETA } from '../constants/fichaGestion.constants';
import {
  mapCatalogToOptions,
  mapPaletaRespuestaToOptions,
} from '../../../shared/utils/selectOptions.utils';
import type { FichaGestionCatalogos } from '../types/fichaGestion.types';

export const useFichaGestionCatalogos = (
  idCliente: string,
  idCartera: string,
  idContrato: string,
  np0: string,
  np1: string
): FichaGestionCatalogos => {
  const {
    data: estadosData,
    isLoading: isLoadingEstados,
    error: errorEstados,
  } = useGestionEstados(idCliente);

  const estadosOptions = mapCatalogToOptions(estadosData);

  const {
    data: tiposData,
    isLoading: isLoadingTipos,
    error: errorTipos,
  } = useGestionTipos();

  const tiposOptions = mapCatalogToOptions(tiposData);

  const {
    data: np0Data,
    isLoading: isLoadingNP0,
    error: errorNP0,
  } = useGestionPaletaRespuesta(
    idCliente,
    idContrato,
    0,
    '0',
    TIPO_GESTION_PALETA
  );

  const {
    data: np1Data,
    isLoading: isLoadingNP1,
    error: errorNP1,
  } = useGestionPaletaRespuesta(
    idCliente,
    idContrato,
    1,
    np0,
    TIPO_GESTION_PALETA
  );

  const {
    data: np2Data,
    isLoading: isLoadingNP2,
    error: errorNP2,
  } = useGestionPaletaRespuesta(
    idCliente,
    idContrato,
    2,
    np1,
    TIPO_GESTION_PALETA
  );

  const np0Options = mapPaletaRespuestaToOptions(np0Data);
  const np1Options = mapPaletaRespuestaToOptions(np1Data);
  const np2Options = mapPaletaRespuestaToOptions(np2Data);

  const {
    data: estadoGestionClaroData,
    isLoading: isLoadingEstadoGestionClaro,
    error: errorEstadoGestionClaro,
  } = useGestionEstadoGestionClaro(idCliente, idCartera);

  const estadoGestionClaroOptions = mapCatalogToOptions(
    estadoGestionClaroData
  );

  const {
    data: motivoNoPagoData,
    isLoading: isLoadingMotivoNoPago,
    error: errorMotivoNoPago,
  } = useGestionMotivoNoPago(idCliente, idCartera);

  const motivoNoPagoOptions = mapCatalogToOptions(motivoNoPagoData);

  return {
    estadosOptions,
    isLoadingEstados,
    errorEstados,

    tiposOptions,
    isLoadingTipos,
    errorTipos,

    np0Options,
    isLoadingNP0,
    errorNP0,

    np1Options,
    isLoadingNP1,
    errorNP1,

    np2Options,
    isLoadingNP2,
    errorNP2,

    estadoGestionClaroOptions,
    isLoadingEstadoGestionClaro,
    errorEstadoGestionClaro,

    motivoNoPagoOptions,
    isLoadingMotivoNoPago,
    errorMotivoNoPago,
  };
};
