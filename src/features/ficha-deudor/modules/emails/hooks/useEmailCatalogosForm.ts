import { useEmailStatuses } from './useEmailsByDeudor';
import { mapCatalogToSelectOptions } from '../../../shared/utils/catalogOptions.utils';

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