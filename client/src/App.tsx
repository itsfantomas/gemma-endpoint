import { useConfig } from './hooks/useConfig';
import { useHealth } from './hooks/useHealth';
import { BentoGrid } from './components/BentoGrid';
import { ConfigTile } from './components/ConfigTile';
import { StatusTile } from './components/StatusTile';
import { ContextTile } from './components/ContextTile';
import { PixelPlasma } from './components/PixelPlasma';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { AnimationToggle } from './components/AnimationToggle';
import { useTranslation } from './contexts/LanguageContext';
import { useCallback, useRef, useState, useEffect } from 'react';

export default function App() {
  const { config, loading, saving, error, updateConfig } = useConfig();
  const { isOnline, lastUsage } = useHealth(5000);
  const { t } = useTranslation();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Persist visual effects setting in localStorage
  const [effectsEnabled, setEffectsEnabled] = useState(() => {
    const saved = localStorage.getItem('gemma_fx_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  useEffect(() => {
    localStorage.setItem('gemma_fx_enabled', effectsEnabled.toString());
  }, [effectsEnabled]);

  const handleCopyEndpoint = async () => {
    try {
      await navigator.clipboard.writeText(`http://localhost:${config.port}/v1`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // Debounced save for static content changes
  const handleStaticContentChange = useCallback(
    (text: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        updateConfig({ staticContent: text } as any);
      }, 1000);
    },
    [updateConfig]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          <div className="w-8 h-8 border-2 border-accent-500/30 border-t-accent-500 rounded-full animate-spin" />
          <p className="text-sm text-white/60">{t.loadingConfig}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Pixel Plasma */}
      <PixelPlasma animate={effectsEnabled} />

      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/[0.01] border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between relative z-10 gap-4 sm:gap-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/40 to-fuchsia-600/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-sm font-bold shadow-[0_4px_15px_rgba(168,85,247,0.2),inset_0_1px_0_rgba(255,255,255,0.2)]">
              G
            </div>
            <div>
              <h1 className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 via-blue-500 to-fuchsia-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] tracking-widest uppercase">
                {t.appTitle}
              </h1>
              <p className="text-xs text-white/60 uppercase tracking-widest">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Animation FX Toggle */}
            <AnimationToggle enabled={effectsEnabled} onChange={setEffectsEnabled} />

            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Status badge */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md transition-all duration-500 ${
                isOnline
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                  : 'bg-red-500/10 border-red-500/20 text-red-400'
              }`}
            >
              <div className="relative">
                <div
                  className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400' : 'bg-red-400'}`}
                />
                {isOnline && (
                  <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping opacity-40" />
                )}
              </div>
              {isOnline ? t.online : t.offline}
            </div>
          </div>
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4 relative z-10">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 drop-shadow-[0_0_5px_rgba(245,158,11,0.5)] animate-fade-in backdrop-blur-md">
            ⚠️ {error}
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <BentoGrid>
          <ConfigTile config={config} saving={saving} onSave={updateConfig} />
          <StatusTile />
          <ContextTile
            staticContent={config.staticContent || ''}
            onStaticContentChange={handleStaticContentChange}
            lastUsage={lastUsage ?? config.lastUsage ?? null}
          />
        </BentoGrid>

        {/* Footer info */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <p className="text-xs text-white/60">
            {t.apiEndpoint} <code className="text-white/60 bg-white/5 border border-white/10 px-2 py-1 rounded font-mono shadow-[inset_0_0_10px_rgba(0,0,0,0.2)]">
              http://localhost:{config.port}/v1
            </code>
          </p>
          <button
            onClick={handleCopyEndpoint}
            className="p-1.5 rounded-md bg-white/5 border border-white/10 text-white/40 hover:text-accent-400 hover:bg-white/10 hover:border-accent-500/30 transition-all active:scale-95"
            title={t.copy || "Copy endpoint"}
            aria-label="Copy API Endpoint"
          >
            {copied ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
