import { useTranslation } from '../contexts/LanguageContext';
import { Language } from '../translations';

export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  const langs: Language[] = ['en', 'ru', 'uk', 'pl'];

  return (
    <div className="flex bg-white/[0.03] border border-white/10 rounded-lg p-0.5 backdrop-blur-md">
      {langs.map((lang) => (
        <button
          key={lang}
          onClick={() => handleLanguageChange(lang)}
          className={`
            px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-md transition-all duration-200
            ${language === lang ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/80 hover:bg-white/[0.05]'}
          `}
        >
          {lang}
        </button>
      ))}
    </div>
  );
}
