import {
  getOptionPopupType,
  type ApplicationOptionPopupType,
} from '@features/access-control';

export const MENU_MODULO_ACTIONS = {
  PRODUCCION_ONLINE:
    'produccion-online',
} as const;

export type MenuModuloAction =
  ApplicationOptionPopupType;

export const getMenuModuloAction = (
  optionId: number
): MenuModuloAction | null =>
  getOptionPopupType(optionId);
