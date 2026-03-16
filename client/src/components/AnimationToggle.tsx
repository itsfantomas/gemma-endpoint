interface AnimationToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}

export function AnimationToggle({ enabled, onChange }: AnimationToggleProps) {
  return (
    <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-1.5 backdrop-blur-md h-[30px]">
      <span className="text-[10px] font-semibold tracking-wider uppercase text-white/50">
        FX
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`
          relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-accent-400/50
          ${enabled ? 'bg-accent-500/60 shadow-[0_0_8px_rgba(168,85,247,0.4)]' : 'bg-surface-800/80'}
        `}
      >
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 
            transition duration-200 ease-in-out
            ${enabled ? 'translate-x-4 shadow-[0_0_5px_theme(colors.white)]' : 'translate-x-0 opacity-50'}
          `}
        />
      </button>
    </div>
  );
}
