import { isPopupWindow } from '../utils/authWindowStorage';
import { useMainWindowRegistration } from './useMainWindowRegistration';
import { usePendingLastMainLogout } from './usePendingLastMainLogout';

export const useLastMainWindowLogout = (isAuthenticated: boolean) => {
  const popupWindow = isPopupWindow();
  const processPendingLogout = usePendingLastMainLogout(popupWindow);

  useMainWindowRegistration({
    isAuthenticated,
    isPopup: popupWindow,
    processPendingLogout,
  });
};
