import React, { createContext, useContext } from 'react';
import type { DeudorInfo } from '../../../shared/types';

const DeudorContext = createContext<DeudorInfo | null>(null);

export const DeudorProvider: React.FC<{
  value: DeudorInfo | null;
  children: React.ReactNode;
}> = ({ value, children }) => {
  return (
    <DeudorContext.Provider value={value}>
      {children}
    </DeudorContext.Provider>
  );
};

export const useDeudor = (): DeudorInfo | null => {
  return useContext(DeudorContext);
};