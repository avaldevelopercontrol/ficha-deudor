import {
  createContext,
} from 'react';

import type {
  AccessControlContextValue,
} from '../types/accessControl.types';

export const AccessControlContext =
  createContext<
    AccessControlContextValue | null
  >(null);
