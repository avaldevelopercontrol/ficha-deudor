import {
  useContext,
} from 'react';

import {
  AccessControlContext,
} from '../contexts/accessControlContextValue';

export const useAccessControl = () => {
  const context = useContext(
    AccessControlContext
  );

  if (!context) {
    throw new Error(
      'useAccessControl debe utilizarse dentro de AccessControlProvider.'
    );
  }

  return context;
};
