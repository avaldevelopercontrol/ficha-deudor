import { createContext, useContext } from 'react';

import type { DeudorInfo } from '../types';

export const DeudorContext = createContext<DeudorInfo | null>(null);

export const useDeudor = (): DeudorInfo | null => {
  return useContext(DeudorContext);
};