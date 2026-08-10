import type {
  GestionDeudorSearchCardProps,
} from '../../modules/busqueda/components/GestionDeudorSearchCard';
import type {
  GestionDeudorResultsCardProps,
} from '../../modules/listado/components/GestionDeudorResultsCard';
import type {
  DeudorGestionDeudor,
  TipoBusquedaGestionDeudor,
} from '../../types/gestionDeudor.types';

interface GestionDeudorSearchState {
  tipoBusqueda: TipoBusquedaGestionDeudor;
  valorBusqueda: string;
  isLoading: boolean;
  error: string | null;
  setTipoBusqueda: (
    value: TipoBusquedaGestionDeudor
  ) => void;
  setValorBusqueda: (value: string) => void;
  buscar: () => void;
  limpiar: () => void;
}

interface GestionDeudorResultsState {
  paginatedData: DeudorGestionDeudor[];
  isLoading: boolean;
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  setPageNumber: (pageNumber: number) => void;
  setPageSize: (pageSize: number) => void;
}

interface BuildGestionDeudorResultsPropsParams {
  state: GestionDeudorResultsState;
  columns: GestionDeudorResultsCardProps['columns'];
  onRowClick: GestionDeudorResultsCardProps['onRowClick'];
  onOpenProduccionGestorHoy:
    GestionDeudorResultsCardProps['onOpenProduccionGestorHoy'];
  isProduccionGestorHoyDisabled:
    GestionDeudorResultsCardProps['isProduccionGestorHoyDisabled'];
}

export interface GestionDeudorRecordRange {
  indiceInicio: number;
  indiceFin: number;
}

export const resolveGestionDeudorRecordRange = (
  pageNumber: number,
  pageSize: number,
  totalRecords: number
): GestionDeudorRecordRange => {
  const indiceInicio =
    (pageNumber - 1) * pageSize;

  return {
    indiceInicio,
    indiceFin: Math.min(
      indiceInicio + pageSize,
      totalRecords
    ),
  };
};

export const buildGestionDeudorSearchProps = (
  state: GestionDeudorSearchState
): GestionDeudorSearchCardProps => ({
  tipoBusqueda: state.tipoBusqueda,
  valorBusqueda: state.valorBusqueda,
  isLoading: state.isLoading,
  error: state.error,
  onTipoBusquedaChange: state.setTipoBusqueda,
  onValorBusquedaChange: state.setValorBusqueda,
  onBuscar: state.buscar,
  onLimpiar: state.limpiar,
});

export const buildGestionDeudorResultsProps = ({
  state,
  columns,
  onRowClick,
  onOpenProduccionGestorHoy,
  isProduccionGestorHoyDisabled,
}: BuildGestionDeudorResultsPropsParams):
  GestionDeudorResultsCardProps => {
  const range = resolveGestionDeudorRecordRange(
    state.pageNumber,
    state.pageSize,
    state.totalRecords
  );

  return {
    columns,
    data: state.paginatedData,
    isLoading: state.isLoading,
    pageNumber: state.pageNumber,
    pageSize: state.pageSize,
    totalRecords: state.totalRecords,
    totalPages: state.totalPages,
    ...range,
    onRowClick,
    onPageNumberChange: state.setPageNumber,
    onPageSizeChange: state.setPageSize,
    onOpenProduccionGestorHoy,
    isProduccionGestorHoyDisabled,
  };
};
