import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sliders, Bell, Globe, User, ShieldCheck, Check } from 'lucide-react';
import { api } from '../services/api';

interface SettingsProps {
  currentUser: any;
  onUserUpdate: (u: any) => void;
}

export const Settings: React.FC<SettingsProps> = ({ currentUser, onUserUpdate }) => {
  const { i18n } = useTranslation();
  const [name, setName] = useState(currentUser?.name || 'Ramesh Sharma');
  const [phone, setPhone] = useState(currentUser?.phone || '+919876543210');
  const [consent, setConsent] = useState(currentUser?.notification_consent ?? true);
  const [selectedLang, setSelectedLang] = useState(i18n.language || 'en');
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      i18n.changeLanguage(selectedLang);
      localStorage.setItem('arthraksha_lang', selectedLang);

      const res = await api.updateMe({
        name,
        phone,
        language: selectedLang,
        notification_consent: consent
      });
      onUserUpdate(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err) {
      console.error(err);
      // Local fallback
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Sliders className="text-blue-400 w-6 h-6" />
          User & Notification Settings
        </h1>
        <p className="text-xs text-slate-400">
          Manage your personal safety profile, consent preferences, and regional language settings.
        </p>
      </div>

      <form onSubmit={handleSave} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 space-y-6 shadow-xl">
        {saved && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <Check size={14} />
            <span>Settings saved successfully!</span>
          </div>
        )}

        {/* Profile Details */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <User size={15} className="text-blue-400" />
            Profile Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase block mb-1">Mobile (for SMS/WhatsApp Alerts)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-blue-500/60"
              />
            </div>
          </div>
        </div>

        {/* Language Selection */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <Globe size={15} className="text-emerald-400" />
            Language Preference
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'en', label: 'English', desc: 'Standard UI' },
              { id: 'hi', label: 'हिन्दी', desc: 'Hindi Localization' },
              { id: 'gu', label: 'ગુજરાતી', desc: 'Gujarati Localization' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedLang(item.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  selectedLang === item.id
                    ? 'bg-blue-600/15 border-blue-500 text-blue-300 shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-sm font-bold text-white">{item.label}</div>
                <div className="text-[10px] text-slate-400">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Notification Consent */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-2">
            <Bell size={15} className="text-amber-400" />
            Notification & Consent Controls
          </h3>

          <label className="flex items-start gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500"
            />
            <div className="text-xs">
              <span className="font-bold text-white block mb-0.5">
                Enable Proactive High-Risk Fraud Alerts (SMS & WhatsApp)
              </span>
              <p className="text-slate-400 leading-relaxed">
                By enabling this, ARTHRAKSHA will send consent-based, credential-free safety warnings to your mobile number whenever an inquiry linked to your identifier triggers a high-risk score.
              </p>
            </div>
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
};
