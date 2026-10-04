import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    localStorage.setItem('arthraksha_lang', newLang);
  };

  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/80 text-xs text-slate-300">
      <Globe size={14} className="text-blue-400 shrink-0" />
      <select
        value={i18n.language || 'en'}
        onChange={handleLanguageChange}
        className="bg-transparent border-none text-slate-200 focus:outline-none cursor-pointer text-xs font-medium"
      >
        <option value="en" className="bg-slate-900 text-slate-200">English</option>
        <option value="hi" className="bg-slate-900 text-slate-200">हिन्दी</option>
        <option value="gu" className="bg-slate-900 text-slate-200">ગુજરાતી</option>
      </select>
    </div>
  );
};
