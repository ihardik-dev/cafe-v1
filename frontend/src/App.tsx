import { useEffect } from 'react';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { AppRoutes } from './routes/AppRoutes';
import { useAuthStore } from './features/auth/authStore';

export function App() {
  useEffect(() => {
    // Hydrate existing user session from token on application startup
    void useAuthStore.getState().initialize();
  }, []);

  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
}

export default App;
