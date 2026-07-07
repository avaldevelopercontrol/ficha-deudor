import { useEmailStatuses } from './popups/useEmailsByDeudor';
import { mapCatalogToSelectOptions } from '../utils/catalogOptions.utils';

export const useEmailCatalogosForm = () => {
  const {
    data: statusesData,
    isLoading: isLoadingStatuses,
    error: errorStatuses,
  } = useEmailStatuses();

  return {
    statusesOptions: mapCatalogToSelectOptions(statusesData),
    isLoadingStatuses,
    errorStatuses,
  };
};