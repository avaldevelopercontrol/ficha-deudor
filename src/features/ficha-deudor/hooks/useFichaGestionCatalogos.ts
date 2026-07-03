import {
  useGestionEstados,
  useGestionTipos,
  useGestionPaletaRespuesta,
  useGestionEstadoGestionClaro,
  useGestionMotivoNoPago,
} from './useFichaGestion';

const TIPO_GESTION_PALETA = '3';

export const useFichaGestionCatalogos = (
  idCliente: string,
  idCartera: string,
  idContrato: string,
  np0: string,
  np1: string
) => {
  const {
    data: estadosData,
    isLoading: isLoadingEstados,
    error: errorEstados,
  } = useGestionEstados(idCliente);

  const estadosOptions = estadosData?.map((estado) => ({
    id: estado.id,
    label: estado.nombre,
  })) ?? [];

  const {
    data: tiposData,
    isLoading: isLoadingTipos,
    error: errorTipos,
  } = useGestionTipos();

  const tiposOptions = tiposData?.map((tipo) => ({
    id: tipo.id,
    label: tipo.nombre,
  })) ?? [];

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

  const np0Options = np0Data?.map((item) => ({
    id: item.id,
    label: item.nombre,
    idTipoContacto: item.idTipoContacto ?? null,
  })) ?? [];

  const np1Options = np1Data?.map((item) => ({
    id: item.id,
    label: item.nombre,
    idTipoContacto: item.idTipoContacto ?? null,
  })) ?? [];

  const np2Options = np2Data?.map((item) => ({
    id: item.id,
    label: item.nombre,
    idTipoContacto: item.idTipoContacto ?? null,
  })) ?? [];

  const {
    data: estadoGestionClaroData,
    isLoading: isLoadingEstadoGestionClaro,
    error: errorEstadoGestionClaro,
  } = useGestionEstadoGestionClaro(idCliente, idCartera);

  const estadoGestionClaroOptions = estadoGestionClaroData?.map((item) => ({
    id: item.id,
    label: item.nombre,
  })) ?? [];

  const {
    data: motivoNoPagoData,
    isLoading: isLoadingMotivoNoPago,
    error: errorMotivoNoPago,
  } = useGestionMotivoNoPago(idCliente, idCartera);

  const motivoNoPagoOptions = motivoNoPagoData?.map((item) => ({
    id: item.id,
    label: item.nombre,
  })) ?? [];

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