import { AppRouter } from './router/AppRouter';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useLastMainWindowLogout } from '../features/auth/hooks/useLastMainWindowLogout';
import { hasAuthenticatedIdentity } from '../features/auth/utils';

function AppContent() {
  const auth = useAuth();

  useLastMainWindowLogout(hasAuthenticatedIdentity(auth));

  return <AppRouter />;
}

export default function App() {
  return <AppContent />;
}
