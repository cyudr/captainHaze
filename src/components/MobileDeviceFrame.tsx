import React from 'react';
import { Wifi, Battery, Signal, ArrowLeft } from 'lucide-react';
import { AppTab } from './Navbar';
import { MobileBottomNav } from './MobileBottomNav';
import { AppLanguage } from '../utils/i18n';

interface MobileDeviceFrameProps {
  children: React.ReactNode;
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  language: AppLanguage;
  pageScale: number;
  onExitMobilePreview: () => void;
}

export const MobileDeviceFrame: React.FC<MobileDeviceFrameProps> = ({
  children,
  activeTab,
  onSelectTab,
  language,
  pageScale,
  onExitMobilePreview,
}) => {
  const currentTime = new Date().toLocaleTimeString('en-SG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <div className="py-6 sm:py-10 px-2 flex flex-col items-center justify-center min-h-[calc(100vh-140px)]">
      {/* Mobile Preview Header Banner */}
      <div className="mb-4 flex items-center justify-between gap-4 w-full max-w-[420px] px-2 text-xs text-slate-500 dark:text-slate-400">
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          📱 Smartphone Touch Viewport (390×844px)
        </span>
        <button
          onClick={onExitMobilePreview}
          className="text-sky-600 dark:text-sky-400 hover:underline font-medium"
        >
          Exit Preview
        </button>
      </div>

      {/* Realistic Smartphone Shell */}
      <div
        className="relative w-full max-w-[400px] h-[820px] bg-slate-900 rounded-[50px] p-3 shadow-2xl border-4 border-slate-700/80 ring-1 ring-slate-950/50 transition-transform duration-300 origin-top"
        style={{ transform: `scale(${pageScale})` }}
      >
        {/* Outer Phone Frame Details: Side Buttons Simulation */}
        <div className="absolute -left-5 top-28 w-1 h-10 bg-slate-600 rounded-l-md" />
        <div className="absolute -left-5 top-44 w-1 h-14 bg-slate-600 rounded-l-md" />
        <div className="absolute -left-5 top-60 w-1 h-14 bg-slate-600 rounded-l-md" />
        <div className="absolute -right-5 top-36 w-1 h-20 bg-slate-600 rounded-r-md" />

        {/* Screen Bezel Area */}
        <div className="w-full h-full bg-slate-50 dark:bg-slate-950 rounded-[40px] overflow-hidden flex flex-col relative border border-slate-800/40">
          {/* iOS-style Status Bar with Dynamic Island */}
          <div className="h-10 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-6 flex items-center justify-between text-[11px] font-semibold text-slate-900 dark:text-white shrink-0 z-30 border-b border-slate-200/50 dark:border-slate-800/50">
            <span>{currentTime}</span>

            {/* Dynamic Island pill */}
            <div className="w-24 h-5 bg-black rounded-full mx-auto flex items-center justify-end px-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
            </div>

            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <Signal className="w-3 h-3" />
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Scrollable Mobile Page Body */}
          <div className="flex-1 overflow-y-auto pb-20 scrollbar-thin">
            {children}
          </div>

          {/* Embedded Mobile Bottom Tab Navigation */}
          <div className="relative z-30">
            <MobileBottomNav
              activeTab={activeTab}
              onSelectTab={onSelectTab}
              language={language}
            />
          </div>

          {/* iOS Bottom Home Indicator Bar */}
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-400 dark:bg-slate-600 rounded-full z-50 pointer-events-none" />
        </div>
      </div>
    </div>
  );
};
