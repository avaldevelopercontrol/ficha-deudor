import {
  createContext,
  useContext,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';

interface AppLayoutContextValue {
  setHeaderActions: Dispatch<SetStateAction<ReactNode>>;
}

export const AppLayoutContext = createContext<AppLayoutContextValue | null>(
  null
);

export const useAppLayout = () => {
  const context = useContext(AppLayoutContext);

  if (!context) {
    throw new Error('useAppLayout debe usarse dentro de AppLayout');
  }

  return context;
};