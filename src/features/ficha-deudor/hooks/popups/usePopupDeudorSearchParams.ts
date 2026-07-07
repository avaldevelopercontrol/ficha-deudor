import { useSearchParams } from 'react-router-dom';

import { getPopupDeudorSearchParams } from '../../utils/popupSearchParams.utils';

interface UsePopupDeudorSearchParamsReturn {
  nombre: string;
  documento: string;
}

export const usePopupDeudorSearchParams =
  (): UsePopupDeudorSearchParamsReturn => {
    const [searchParams] = useSearchParams();

    return getPopupDeudorSearchParams(searchParams);
  };