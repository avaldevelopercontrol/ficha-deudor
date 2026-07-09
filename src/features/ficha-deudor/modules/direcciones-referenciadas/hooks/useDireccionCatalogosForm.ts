import {
  useDepartamentos,
  useProvincias,
  useDistritos,
  useDireccionUbicaciones,
} from './useDireccionesReferenciadas';
import { mapCatalogToSelectOptions } from '../../../shared/utils/catalogOptions.utils';

export const useDireccionCatalogosForm = (
  departamento: string | null,
  provincia: string | null
) => {
  const {
    data: departamentosData,
    isLoading: isLoadingDepartamentos,
    error: errorDepartamentos,
  } = useDepartamentos();

  const { data: provinciasData, isLoading: isLoadingProvincias } =
    useProvincias(departamento);

  const { data: distritosData, isLoading: isLoadingDistritos } = useDistritos(
    departamento,
    provincia
  );

  const {
    data: ubicacionesData,
    isLoading: isLoadingUbicaciones,
    error: errorUbicaciones,
  } = useDireccionUbicaciones();

  return {
    departamentos: mapCatalogToSelectOptions(departamentosData),
    provincias: mapCatalogToSelectOptions(provinciasData),
    distritos: mapCatalogToSelectOptions(distritosData),
    refUbicacionOptions: mapCatalogToSelectOptions(ubicacionesData),

    isLoadingDepartamentos,
    isLoadingProvincias,
    isLoadingDistritos,
    isLoadingUbicaciones,

    errorDepartamentos,
    errorUbicaciones,
  };
};