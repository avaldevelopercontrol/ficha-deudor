import {
  useGestionDeudores,
} from '../../hooks/useGestionDeudores';
import {
  useGestionDeudorColumns,
} from '../../modules/listado/hooks/useGestionDeudorColumns';
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
  const {
    idCliente,
    idUsuario,
  } = useGestionDeudorPageContext();
  const deudores = useGestionDeudores(idCliente);
  const columns = useGestionDeudorColumns();
  const { goToFichaDeudor } =
    useGestionDeudorNavigation({
      idCliente,
      idUsuario,
    });
  const {
    isDisabled:
      isProduccionGestorHoyDisabled,
    handleOpenProduccionGestorHoy,
  } = useProduccionGestorHoyPopup({
    idCliente,
    idUsuario,
  });

  return {
    searchProps:
      buildGestionDeudorSearchProps(
        deudores
      ),
    resultsProps:
      buildGestionDeudorResultsProps({
        state: deudores,
        columns,
        onRowClick: goToFichaDeudor,
        onOpenProduccionGestorHoy:
          handleOpenProduccionGestorHoy,
        isProduccionGestorHoyDisabled,
      }),
  };
};
