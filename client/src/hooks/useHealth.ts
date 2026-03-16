import { useState, useEffect, useRef } from 'react';

export function useHealth(intervalMs: number = 5000) {
  const [isOnline, setIsOnline] = useState(false);
  const [latency, setLatency] = useState<number | null>(null);
  const [lastUsage, setLastUsage] = useState<{
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  } | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      const start = Date.now();
      try {
        const [healthRes, configData] = await Promise.all([
          fetch('/api/health', { signal: AbortSignal.timeout(3000) }),
          fetch('/api/config', { signal: AbortSignal.timeout(3000) }).then(r => r.json()).catch(() => null)
        ]);
        
        if (healthRes.ok) {
          setIsOnline(true);
          setLatency(Date.now() - start);
        } else {
          setIsOnline(false);
          setLatency(null);
        }

        if (configData && configData.lastUsage) {
          setLastUsage(configData.lastUsage);
        }
      } catch {
        setIsOnline(false);
        setLatency(null);
      }
    };

    // Check immediately on mount
    checkHealth();

    // Then poll
    intervalRef.current = setInterval(checkHealth, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [intervalMs]);

  return { isOnline, latency, lastUsage };
}
