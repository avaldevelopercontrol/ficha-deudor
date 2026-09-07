import {
  useGestionDeudores,
} from '../../hooks/useGestionDeudores';
import {
  GESTION_DEUDOR_COLUMNS,
} from '../../modules/listado/constants/gestionDeudorColumns.constants';
import {
  useProduccionGestorHoyPopup,
} from '../../modules/produccion-gestor-hoy/hooks/useProduccionGestorHoyPopup';
import {
  buildGestionDeudorResultsProps,
  buildGestionDeudorSearchProps,
} from '../utils/gestionDeudorPageViewModel.utils';
import {
  useGestionDeudorNavigation,
} from './useGestionDeudorNavigation';
import {
  useGestionDeudorPageContext,
} from './useGestionDeudorPageContext';

export const useGestionDeudorPage = () => {
  const { identity } =
    useGestionDeudorPageContext();
  const deudores = useGestionDeudores(
    identity?.idCliente
  );
  const {
    goToFichaDeudor,
    isDisabled: isFichaDeudorDisabled,
  } = useGestionDeudorNavigation({ identity });
  const {
    isDisabled:
      isProduccionGestorHoyDisabled,
    handleOpenProduccionGestorHoy,
  } = useProduccionGestorHoyPopup({ identity });

  return {
    searchProps:
      buildGestionDeudorSearchProps(
        deudores
      ),
    resultsProps:
      buildGestionDeudorResultsProps({
        state: deudores,
        columns: GESTION_DEUDOR_COLUMNS,
        onRowClick: isFichaDeudorDisabled
          ? undefined
          : goToFichaDeudor,
        onOpenProduccionGestorHoy:
          handleOpenProduccionGestorHoy,
        isProduccionGestorHoyDisabled,
      }),
  };
};
