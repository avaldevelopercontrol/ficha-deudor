import {
  useAccessControl,
} from './useAccessControl';

export const useOptionPermissions = (
  optionId: number
) => {
  const {
    getPermissions,
  } = useAccessControl();

  return getPermissions(optionId);
};
