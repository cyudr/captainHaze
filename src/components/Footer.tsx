import React from 'react';
import { ShieldCheck, Phone } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Footer: React.FC<{
  onSelectTab: (tab: 'overview' | 'live' | 'itinerary' | 'supplies' | 'health' | 'education') => void;
}> = ({ onSelectTab }) => {
  const { t } = useLanguage();

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-16 text-xs text-slate-500 dark:text-slate-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-100 dark:border-slate-800">
          {/* Brand & Purpose */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-base">
              <div className="w-6 h-6 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center text-xs font-bold">
                CH
              </div>
              <span>{t('appName')}</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              {t('appTagline')}. Independent tourist companion app built to navigate seasonal haze in Singapore. Grounded in official NEA PSI data feeds and Singapore Ministry of Health advisories.
            </p>
          </div>

          {/* Quick Tourist Links */}
          <div className="space-y-2">
            <span className="font-semibold text-slate-900 dark:text-white block text-xs">Essential Tools</span>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <button
                  onClick={() => onSelectTab('overview')}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {t('navOverview')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('live')}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {t('navLive')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('itinerary')}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {t('navItinerary')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('supplies')}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {t('navSupplies')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('health')}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {t('navHealth')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('education')}
                  className="hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  {t('navEducation')}
                </button>
              </li>
            </ul>
          </div>

          {/* Singapore Emergency Hotlines */}
          <div className="space-y-2">
            <span className="font-semibold text-slate-900 dark:text-white block text-xs">Singapore Emergency Hotlines</span>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span>Emergency Ambulance (SCDF):</span>
                <a href="tel:995" className="font-bold text-rose-600 dark:text-rose-400 hover:underline">
                  995
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span>Non-Emergency Ambulance:</span>
                <a href="tel:1777" className="font-semibold text-slate-900 dark:text-white hover:underline">
                  1777
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span>Police:</span>
                <a href="tel:999" className="font-semibold text-slate-900 dark:text-white hover:underline">
                  999
                </a>
              </div>
              <div className="flex items-center justify-between">
                <span>MOH HealthLine:</span>
                <a href="tel:18002254488" className="text-slate-600 dark:text-slate-300 hover:underline">
                  1800 225 4488
                </a>
              </div>
            </div>
          </div>

          {/* Official NEA Attribution (Master Prompt Sub-goal 5) */}
          <div className="space-y-2.5">
            <span className="font-semibold text-slate-900 dark:text-white block text-xs">Data Transparency</span>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5 text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Data: National Environment Agency</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 leading-normal">
                Air quality metrics (24-hr PSI and 1-hr PM2.5) are retrieved in real-time from the official Singapore National Environment Agency (NEA) API via data.gov.sg.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Attribution */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>
            <span>© {new Date().getFullYear()} Non-Haze Activities Team. Developed for Singapore tourists and residents.</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="font-medium text-slate-700 dark:text-slate-300">Data: National Environment Agency</span>
            <span>·</span>
            <a
              href="https://www.haze.gov.sg"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline text-slate-600 dark:text-slate-400"
            >
              haze.gov.sg
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
