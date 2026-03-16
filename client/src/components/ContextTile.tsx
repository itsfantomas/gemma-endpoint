import { useState, useEffect, useMemo } from 'react';
import { encode } from 'gpt-tokenizer';
import { useTranslation } from '../contexts/LanguageContext';

const MAX_CONTEXT = 15000;
const SAFETY_BUFFER = 500;
const WARNING_THRESHOLD = 12000;

interface ContextTileProps {
  staticContent: string;
  onStaticContentChange: (text: string) => void;
  lastUsage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  } | null;
}

export function ContextTile({ staticContent, onStaticContentChange, lastUsage }: ContextTileProps) {
  const { t } = useTranslation();
  const [localText, setLocalText] = useState(staticContent);

  // Sync when parent updates (e.g., config load)
  useEffect(() => {
    setLocalText(staticContent);
  }, [staticContent]);

  // Real-time token estimation using gpt-tokenizer
  const staticTokens = useMemo(() => {
    if (!localText || localText.trim().length === 0) return 0;
    try {
      return encode(localText).length;
    } catch {
      // Fallback to char-based estimation
      return Math.ceil(localText.length / 4);
    }
  }, [localText]);

  const chatBudget = Math.max(0, MAX_CONTEXT - staticTokens - SAFETY_BUFFER);
  const isOverWarning = staticTokens > WARNING_THRESHOLD;
  const usagePercent = Math.min(100, (staticTokens / MAX_CONTEXT) * 100);

  const handleChange = (text: string) => {
    setLocalText(text);
    onStaticContentChange(text);
  };

  return (
    <div className="bento-tile md:col-span-2 lg:col-span-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
      <h2 className="tile-title">{t.contextEstimator}</h2>

      {/* Warning Banner */}
      {isOverWarning && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl animate-fade-in">
          <p className="text-xs text-amber-300 flex items-center gap-2">
            <span className="text-base">⚠️</span>
            {t.staticContentExceeds.replace('{threshold}', WARNING_THRESHOLD.toLocaleString())}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Textarea */}
        <div className="lg:col-span-2">
          <label className="block text-xs text-white/60 mb-1.5 uppercase tracking-widest">
            {t.staticContentLabel}
          </label>
          <textarea
            className="input-field h-40 resize-y font-mono text-xs leading-relaxed bg-black/40"
            placeholder={t.staticContentPlaceholder}
            value={localText}
            onChange={(e) => handleChange(e.target.value)}
          />
        </div>

        {/* Stats Panel */}
        <div className="space-y-3">
          {/* Token count */}
          <div className="bg-black/40 rounded-xl p-3 border border-white/5 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-widest text-white/60 mb-1">{t.staticTokens}</p>
            <p className={`text-2xl font-bold font-mono drop-shadow-[0_0_8px_currentColor] ${isOverWarning ? 'text-amber-400' : 'text-accent-400'}`}>
              {staticTokens.toLocaleString()}
            </p>
            {/* Progress bar */}
            <div className="mt-2 h-1.5 bg-black/40 border border-white/5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 shadow-[0_0_10px_currentColor] ${
                  isOverWarning ? 'bg-amber-400' : usagePercent > 60 ? 'bg-yellow-400' : 'bg-accent-500'
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <p className="text-xs text-white/60 mt-1 font-mono uppercase tracking-widest">
              {staticTokens.toLocaleString()} / {MAX_CONTEXT.toLocaleString()}
            </p>
          </div>

          {/* Chat budget */}
          <div className="bg-black/40 rounded-xl p-3 border border-white/5 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-widest text-white/60 mb-1">{t.chatTokenBudget}</p>
            <p className="text-2xl font-bold font-mono text-emerald-400 drop-shadow-[0_0_8px_theme(colors.emerald.400)]">
              {chatBudget.toLocaleString()}
            </p>
            <p className="text-xs text-white/60 mt-1 uppercase tracking-widest">
              {MAX_CONTEXT.toLocaleString()} − {staticTokens.toLocaleString()} − {SAFETY_BUFFER} {t.buffer}
            </p>
          </div>

          {/* Last usage */}
          <div className="bg-black/40 rounded-xl p-3 border border-white/5 backdrop-blur-sm">
            <p className="text-xs uppercase tracking-widest text-white/60 mb-2">{t.lastRequestUsage}</p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-white/60 uppercase tracking-widest">{t.prompt}</span>
                <span className="font-mono text-white/90">{lastUsage ? lastUsage.prompt_tokens.toLocaleString() : '-'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/60 uppercase tracking-widest">{t.completion}</span>
                <span className="font-mono text-white/90">{lastUsage ? lastUsage.completion_tokens.toLocaleString() : '-'}</span>
              </div>
              <div className="h-px bg-white/5 my-1" />
              <div className="flex justify-between text-xs">
                <span className="text-white/60 uppercase tracking-widest">{t.total}</span>
                <span className={`font-mono font-medium ${lastUsage ? 'text-accent-400 drop-shadow-[0_0_8px_theme(colors.accent.400)]' : 'text-white/60'}`}>
                  {lastUsage ? lastUsage.total_tokens.toLocaleString() : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
