import { useEffect, useState } from 'react';
import axios from 'axios';

interface HealthData {
  success: boolean;
  message: string;
  data?: {
    database?: string;
  };
}

export function HealthStatusBadge() {
  const [status, setStatus] = useState<'checking' | 'healthy' | 'error'>('checking');
  const [details, setDetails] = useState<string>('Checking backend connection...');
  const [lastChecked, setLastChecked] = useState<string>('');

  const checkHealth = async () => {
    setStatus('checking');
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';
      // Root /health endpoint as exposed by Fastify backend app.ts
      const origin = new URL(baseUrl).origin;
      const res = await axios.get<HealthData>(`${origin}/health`, { timeout: 4000 });

      if (res.data?.success && res.data?.data?.database === 'connected') {
        setStatus('healthy');
        setDetails('API & PostgreSQL connected');
      } else {
        setStatus('error');
        setDetails(res.data?.message || 'Database not connected');
      }
    } catch (err: unknown) {
      setStatus('error');
      const msg = err instanceof Error ? err.message : 'Connection failed';
      setDetails(`Backend unreachable: ${msg}`);
    } finally {
      setLastChecked(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    checkHealth();
    // Poll every 30 seconds in dev
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-border-normal bg-surface-primary/95 px-3 py-1.5 shadow-beautiful-md backdrop-blur-md transition-all duration-200"
    >
      <span className="relative flex h-2.5 w-2.5">
        {status === 'checking' && (
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-amber-400" />
        )}
        {status === 'healthy' && (
          <>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </>
        )}
        {status === 'error' && (
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
        )}
      </span>

      <span className="text-xs font-medium text-content-primary">
        {status === 'healthy'
          ? 'API + DB Connected'
          : status === 'checking'
            ? 'Connecting...'
            : 'API Offline'}
      </span>

      <button
        type="button"
        onClick={checkHealth}
        title={`${details} (Last: ${lastChecked || 'never'}) - Click to refresh`}
        className="ml-1 rounded px-1 text-[10px] font-semibold uppercase tracking-wider text-content-tertiary hover:text-content-primary hover:bg-surface-secondary transition-colors"
      >
        Retry
      </button>
    </div>
  );
}

export default HealthStatusBadge;
