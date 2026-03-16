import { useHealth } from '../hooks/useHealth';
import { useTranslation } from '../contexts/LanguageContext';

export function StatusTile() {
  const { isOnline, latency } = useHealth(5000);
  const { t } = useTranslation();

  return (
    <div className="bento-tile animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <h2 className="tile-title">{t.serverStatus}</h2>

      <div className="flex items-center gap-3">
        {/* Animated status dot */}
        <div className="relative">
          <div
            className={`w-3.5 h-3.5 rounded-full transition-colors duration-500 ${
              isOnline ? 'bg-emerald-400' : 'bg-red-400'
            }`}
          />
          {isOnline && (
            <div className="absolute inset-0 w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping opacity-40" />
          )}
        </div>

        <div>
          <p className={`text-sm font-medium uppercase tracking-widest ${isOnline ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]'}`}>
            {isOnline ? t.connected : t.disconnected}
          </p>
          {isOnline && latency !== null && (
            <p className="text-xs text-white/60 font-mono uppercase tracking-widest mt-0.5">
              {latency}ms {t.latency}
            </p>
          )}
        </div>
      </div>

      {!isOnline && (
        <div className="mt-4 p-3 bg-black/40 border border-white/5 rounded-xl backdrop-blur-sm">
          <p className="text-xs text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)] uppercase tracking-widest">
            {t.backendNotReachable}
          </p>
        </div>
      )}
    </div>
  );
}
