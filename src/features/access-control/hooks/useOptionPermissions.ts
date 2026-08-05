import {
  useAccessControl,
} from './useAccessControl';

export const useOptionPermissions = (
  optionCode: string
) => {
  const {
    getPermissions,
  } = useAccessControl();

  return getPermissions(optionCode);
};
