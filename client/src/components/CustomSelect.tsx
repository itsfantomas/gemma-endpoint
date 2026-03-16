import { useState, useRef, useEffect } from 'react';

interface CustomSelectProps {
  value: string;
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
}

export function CustomSelect({ value, options, onChange }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        className="input-field cursor-pointer flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
        tabIndex={0}
      >
        <span>{selectedOption?.label}</span>
        <svg
          className={`w-4 h-4 transition-transform duration-300 text-white/50 ${isOpen ? 'rotate-180 text-accent-400' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <ul className="absolute z-50 w-full mt-2 bg-[#030014]/95 backdrop-blur-3xl border border-white/20 rounded-xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(168,85,247,0.3)] animate-slide-up origin-top">
          {options.map((option) => (
            <li
              key={option.value}
              className={`px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                option.value === value
                  ? 'bg-accent-500/40 text-white font-medium border-l-2 border-accent-400'
                  : 'text-surface-100 hover:bg-white/10 hover:text-white border-l-2 border-transparent'
              }`}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
