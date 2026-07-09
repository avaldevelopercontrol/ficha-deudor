import type React from 'react';

import { useAuthProviderValue } from '../shell/hooks/useAuthProviderValue';
import { AuthContext } from './authContextValue';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const value = useAuthProviderValue();

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
