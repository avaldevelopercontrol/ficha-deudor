import {
  useTelefonoResultados,
  useTelefonoOperadores,
  useTelefonoUbicaciones,
  useTelefonoHorarioGestion,
  useTelefonoFuenteBusqueda,
} from './useTelefonosReferenciados';
import { mapCatalogToSelectOptions } from '../../../shared/utils/catalogOptions.utils';

export const useTelefonoCatalogosForm = () => {
  const {
    data: resultadosData,
    isLoading: isLoadingResultados,
    error: errorResultados,
  } = useTelefonoResultados();

  const {
    data: operadoresData,
    isLoading: isLoadingOperadores,
    error: errorOperadores,
  } = useTelefonoOperadores();

  const {
    data: ubicacionesData,
    isLoading: isLoadingUbicaciones,
    error: errorUbicaciones,
  } = useTelefonoUbicaciones();

  const {
    data: horariosData,
    isLoading: isLoadingHorarios,
    error: errorHorarios,
  } = useTelefonoHorarioGestion();

  const {
    data: fuentesBusquedaData,
    isLoading: isLoadingFuentes,
    error: errorFuentes,
  } = useTelefonoFuenteBusqueda();

  return {
    resultadosOptions: mapCatalogToSelectOptions(resultadosData),
    operadoresOptions: mapCatalogToSelectOptions(operadoresData),
    ubicacionesOptions: mapCatalogToSelectOptions(ubicacionesData),
    horariosGestionOptions: mapCatalogToSelectOptions(horariosData),
    fuentesBusquedaOptions: mapCatalogToSelectOptions(fuentesBusquedaData),

    isLoadingResultados,
    isLoadingOperadores,
    isLoadingUbicaciones,
    isLoadingHorarios,
    isLoadingFuentes,

    errorResultados,
    errorOperadores,
    errorUbicaciones,
    errorHorarios,
    errorFuentes,
  };
};