import { AppRouter } from './router/AppRouter';
import { useAuth } from '../features/auth/contexts/authContextValue';
import { useLastMainWindowLogout } from '../features/auth/hooks/useLastMainWindowLogout';

function AppContent() {
  const { isAuthenticated } = useAuth();

  useLastMainWindowLogout(isAuthenticated);

  return <AppRouter />;
}

export default function App() {
  return <AppContent />;
}