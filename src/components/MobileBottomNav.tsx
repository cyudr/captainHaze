import React from 'react';
import { Home, ShieldAlert, Compass, ShoppingBag, Stethoscope } from 'lucide-react';
import { AppTab } from './Navbar';
import { AppLanguage, TRANSLATIONS } from '../utils/i18n';

interface MobileBottomNavProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  language: AppLanguage;
  savedPlanCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  language,
  savedPlanCount = 0,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  const tabs: Array<{
    id: AppTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }> = [
    { id: 'overview', label: t.navOverview, icon: Home },
    { id: 'live', label: t.navLive.split(' ')[0] || 'Air', icon: ShieldAlert },
    { id: 'itinerary', label: t.navItinerary.split(' ')[0] || 'Swap', icon: Compass, badge: savedPlanCount },
    { id: 'supplies', label: t.navSupplies.split(' ')[0] || 'Kit', icon: ShoppingBag },
    { id: 'health', label: t.navHealth.split(' ')[0] || 'Clinics', icon: Stethoscope },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 transition-colors shadow-lg"
    >
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] py-1 transition-all active:scale-90 ${
                isActive
                  ? 'text-slate-900 dark:text-white font-bold'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {/* Active Indicator Bar on top */}
              {isActive && (
                <div className="absolute top-0 w-8 h-1 bg-slate-900 dark:bg-sky-400 rounded-b-full transition-all" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-slate-900 dark:text-sky-400' : ''
                  }`}
                />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center font-mono shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className="text-[10px] tracking-tight mt-1 truncate max-w-[56px] text-center">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
