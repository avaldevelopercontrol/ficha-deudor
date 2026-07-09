import React from 'react';

import { DeudorContext } from './deudorContextValue';

import type { DeudorInfo } from '../types';

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