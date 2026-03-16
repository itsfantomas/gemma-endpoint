import { useState, useEffect, useCallback } from 'react';

interface AppConfig {
  apiKey: string;
  apiKeySet: boolean;
  port: number;
  model: string;
  temperature: number;
  topP: number;
  staticContent?: string;
  lastUsage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  } | null;
}

const DEFAULT_CONFIG: AppConfig = {
  apiKey: '',
  apiKeySet: false,
  port: 3000,
  model: 'gemma-3-27b-it',
  temperature: 0.7,
  topP: 0.95,
  staticContent: '',
  lastUsage: null,
};

export function useConfig() {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load config on mount
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/config');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setConfig(data);
      setError(null);
    } catch (err: any) {
      setError('Failed to load config');
      console.error('Config fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateConfig = useCallback(async (partial: Partial<AppConfig>) => {
    try {
      setSaving(true);
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partial),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setConfig(data.config);
      setError(null);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to save config');
      return false;
    } finally {
      setSaving(false);
    }
  }, []);

  return { config, loading, saving, error, updateConfig, refetchConfig: fetchConfig };
}
