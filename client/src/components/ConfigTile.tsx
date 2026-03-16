import { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { CustomSelect } from './CustomSelect';

interface ConfigTileProps {
  config: {
    apiKey: string;
    apiKeySet: boolean;
    port: number;
    model: string;
    temperature: number;
    topP: number;
  };
  saving: boolean;
  onSave: (partial: Record<string, unknown>) => Promise<boolean>;
}

export function ConfigTile({ config, saving, onSave }: ConfigTileProps) {
  const { t } = useTranslation();
  const [apiKey, setApiKey] = useState('');
  const [port, setPort] = useState(config.port);
  const [model, setModel] = useState(config.model);
  const [temperature, setTemperature] = useState(config.temperature);
  const [topP, setTopP] = useState(config.topP);
  const [saved, setSaved] = useState(false);

  // Sync local state when config loads
  useEffect(() => {
    setPort(config.port);
    setModel(config.model);
    setTemperature(config.temperature);
    setTopP(config.topP);
  }, [config.port, config.model, config.temperature, config.topP]);

  const handleSave = async () => {
    const payload: Record<string, unknown> = {
      port,
      model,
      temperature,
      topP,
    };
    // Only send apiKey if user typed a new value
    if (apiKey.length > 0) {
      payload.apiKey = apiKey;
    }

    const success = await onSave(payload);
    if (success) {
      setSaved(true);
      setApiKey('');
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="bento-tile md:col-span-2 lg:col-span-2 animate-slide-up">
      <h2 className="tile-title">{t.configTitle}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* API Key */}
        <div className="sm:col-span-2">
          <label className="block text-xs text-white/60 mb-1.5 uppercase tracking-widest">
            {t.googleApiKey}
            {config.apiKeySet && (
              <span className="ml-2 text-emerald-400 text-[10px]">✔ {t.set}</span>
            )}
          </label>
          <input
            type="password"
            className="input-field font-mono"
            placeholder={config.apiKeySet ? t.apiKeyHiddenPlaceholder : t.apiKeyPlaceholder}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>

        {/* Port */}
        <div>
          <label className="block text-xs text-white/60 mb-1.5 uppercase tracking-widest">{t.port}</label>
          <input
            type="number"
            className="input-field"
            min={1}
            max={65535}
            value={port}
            onChange={(e) => setPort(Number(e.target.value))}
          />
        </div>

        {/* Model */}
        <div>
          <label className="block text-xs text-white/60 mb-1.5 uppercase tracking-widest">{t.model}</label>
          <CustomSelect
            value={model}
            onChange={(val) => setModel(val)}
            options={[
              { label: 'gemma-3-27b-it', value: 'gemma-3-27b-it' },
              { label: 'gemma-3-12b-it', value: 'gemma-3-12b-it' },
              { label: 'gemma-3-4b-it', value: 'gemma-3-4b-it' },
              { label: 'gemma-3-1b-it', value: 'gemma-3-1b-it' },
            ]}
          />
        </div>

        {/* Temperature */}
        <div>
          <label className="flex justify-between text-xs text-white/60 mb-1.5 uppercase tracking-widest">
            <span>{t.temperature}</span>
            <span className="font-mono text-accent-400 drop-shadow-[0_0_8px_theme(colors.accent.400)]">{temperature.toFixed(2)}</span>
          </label>
          <input
            type="range"
            className="slider-track [&::-webkit-slider-thumb]:border-accent-400"
            min={0}
            max={2}
            step={0.01}
            value={temperature}
            onChange={(e) => setTemperature(Number(e.target.value))}
          />
        </div>

        {/* Top P */}
        <div>
          <label className="flex justify-between text-xs text-white/60 mb-1.5 uppercase tracking-widest">
            <span>{t.topP}</span>
            <span className="font-mono text-accent-secondary drop-shadow-[0_0_8px_theme(colors.accent.secondary)]">{topP.toFixed(2)}</span>
          </label>
          <input
            type="range"
            className="slider-track [&::-webkit-slider-thumb]:border-accent-secondary"
            min={0}
            max={1}
            step={0.01}
            value={topP}
            onChange={(e) => setTopP(Number(e.target.value))}
          />
        </div>

        {/* Save Button */}
        <div className="sm:col-span-2 pt-2">
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {t.saving}
              </span>
            ) : saved ? (
              t.saved
            ) : (
              t.saveConfig
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
