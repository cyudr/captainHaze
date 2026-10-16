import React, { useState } from 'react';
import {
  Smartphone,
  Monitor,
  Columns,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Sun,
  Moon,
  Clock,
  Globe,
  Sliders,
  CheckCircle2,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { ThemeMode } from '../utils/theme';
import { AppLanguage, SUPPORTED_LANGUAGES, TRANSLATIONS } from '../utils/i18n';

export type ViewMode = 'responsive' | 'mobile' | 'dual' | 'desktop';

export interface ViewingProgressState {
  viewedRegions: string[];
  viewedAttractions: string[];
  viewedGuides: string[];
  totalTrackableItems: number;
}

interface ViewModeControllerProps {
  viewMode: ViewMode;
  onSetViewMode: (mode: ViewMode) => void;
  pageScale: number;
  onSetPageScale: (scale: number) => void;
  splitRatio: number; // 20 to 80 (e.g. 50 = 50:50)
  onSetSplitRatio: (ratio: number) => void;
  scaleByViewingEnabled: boolean;
  onToggleScaleByViewing: () => void;
  viewingProgress: ViewingProgressState;
  themeMode: ThemeMode;
  onSetThemeMode: (mode: ThemeMode) => void;
  currentLanguage: AppLanguage;
  onSetLanguage: (lang: AppLanguage) => void;
  isSimulating: boolean;
  onOpenSimulator: () => void;
  simulatedPsi: number;
}

export const ViewModeController: React.FC<ViewModeControllerProps> = ({
  viewMode,
  onSetViewMode,
  pageScale,
  onSetPageScale,
  splitRatio,
  onSetSplitRatio,
  scaleByViewingEnabled,
  onToggleScaleByViewing,
  viewingProgress,
  themeMode,
  onSetThemeMode,
  currentLanguage,
  onSetLanguage,
  isSimulating,
  onOpenSimulator,
  simulatedPsi,
}) => {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [controlsExpanded, setControlsExpanded] = useState(false);

  const t = TRANSLATIONS[currentLanguage] || TRANSLATIONS.en;

  // Calculate overall viewing progress
  const totalViewed =
    viewingProgress.viewedRegions.length +
    viewingProgress.viewedAttractions.length +
    viewingProgress.viewedGuides.length;
  const progressPercent = Math.min(
    100,
    Math.round((totalViewed / Math.max(1, viewingProgress.totalTrackableItems)) * 100)
  );

  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="bg-slate-900 text-white border-b border-slate-800 text-xs py-2 px-4 select-none transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: View Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => onSetViewMode('responsive')}
            title="Auto-adapts to browser screen width"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'responsive'
                ? 'bg-slate-800 text-white shadow-xs font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5 text-sky-400" />
            <span className="hidden sm:inline">{t.viewModeResponsive}</span>
          </button>

          <button
            onClick={() => onSetViewMode('mobile')}
            title="Dedicated Smartphone View with touch frame"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'mobile'
                ? 'bg-slate-800 text-white shadow-xs font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.viewModeMobile}</span>
          </button>

          <button
            onClick={() => onSetViewMode('dual')}
            title="Side-by-side dynamic view of Air Monitor & Itinerary pages"
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'dual'
                ? 'bg-slate-800 text-white shadow-xs font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">{t.viewModeDual}</span>
            <span className="md:hidden">Dual</span>
          </button>

          <button
            onClick={() => onSetViewMode('desktop')}
            title="Full-bleed Desktop WebApp"
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg font-medium transition-all ${
              viewMode === 'desktop'
                ? 'bg-slate-800 text-white shadow-xs font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t.viewModeDesktop}</span>
          </button>
        </div>

        {/* Center: Dynamic Scaling & Viewing Done Progress */}
        <div className="flex items-center gap-3">
          {/* Viewing Done Progress Tracker */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors"
            onClick={onToggleScaleByViewing}
            title={`${t.scaleByViewing}: Click to toggle auto-scaling viewed items`}
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2
                className={`w-3.5 h-3.5 ${
                  scaleByViewingEnabled ? 'text-emerald-400' : 'text-slate-500'
                }`}
              />
              <span className="text-[11px] font-semibold text-slate-300">
                {t.viewingDone}:
              </span>
              <span className="font-mono text-emerald-400 font-bold tabular-nums">
                {progressPercent}%
              </span>
            </div>

            {/* Mini Progress Bar */}
            <div className="w-14 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <span
              className={`text-[10px] px-1.5 py-0.5 rounded ${
                scaleByViewingEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {scaleByViewingEnabled ? 'Auto-Scale ON' : 'Scale OFF'}
            </span>
          </div>

          {/* Dynamic Page Scale Controls (85% to 125%) */}
          <div className="hidden sm:flex items-center gap-1.5 bg-slate-950/80 px-2 py-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onSetPageScale(Math.max(0.85, pageScale - 0.05))}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              title="Decrease zoom scale"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] tabular-nums font-semibold text-sky-400 w-11 text-center">
              {Math.round(pageScale * 100)}%
            </span>
            <button
              onClick={() => onSetPageScale(Math.min(1.25, pageScale + 0.05))}
              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
              title="Increase zoom scale"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            {pageScale !== 1 && (
              <button
                onClick={() => onSetPageScale(1)}
                className="text-[10px] text-slate-500 hover:text-slate-300 ml-0.5 underline"
              >
                100%
              </button>
            )}
          </div>

          {/* Dual Page Split Ratio Quick Switcher (Visible in Dual View or toggle) */}
          {viewMode === 'dual' && (
            <div className="hidden lg:flex items-center gap-1 bg-slate-950/80 px-2 py-1 rounded-xl border border-slate-800 text-[11px]">
              <span className="text-slate-400 mr-1">Split:</span>
              <button
                onClick={() => onSetSplitRatio(35)}
                className={`px-1.5 py-0.5 rounded font-mono ${
                  splitRatio === 35 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                35:65
              </button>
              <button
                onClick={() => onSetSplitRatio(50)}
                className={`px-1.5 py-0.5 rounded font-mono ${
                  splitRatio === 50 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                50:50
              </button>
              <button
                onClick={() => onSetSplitRatio(65)}
                className={`px-1.5 py-0.5 rounded font-mono ${
                  splitRatio === 65 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                65:35
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Theme Switcher & Language Selector */}
        <div className="flex items-center gap-2">
          {/* Light / Dark Mode Toggle with Time Detection */}
          <div className="flex items-center bg-slate-950/80 p-0.5 rounded-xl border border-slate-800">
            <button
              onClick={() => onSetThemeMode('light')}
              title={`${t.themeLight} mode`}
              className={`p-1.5 rounded-lg transition-colors ${
                themeMode === 'light'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSetThemeMode('dark')}
              title={`${t.themeDark} mode`}
              className={`p-1.5 rounded-lg transition-colors ${
                themeMode === 'dark'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onSetThemeMode('auto')}
              title={`${t.themeAuto} mode - default based on detected time`}
              className={`px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-colors ${
                themeMode === 'auto'
                  ? 'bg-slate-800 text-sky-300 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3 h-3 text-sky-400" />
              <span className="hidden sm:inline">Auto</span>
            </button>
          </div>

          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-slate-200 font-medium transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>{currentLangObj.flag}</span>
              <span className="text-[11px] font-semibold">{currentLangObj.code.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {langDropdownOpen && (
              <div
                className="absolute right-0 mt-1.5 w-48 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl py-1.5 z-50 animate-fade-in"
                onMouseLeave={() => setLangDropdownOpen(false)}
              >
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Select Language
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onSetLanguage(lang.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between text-xs transition-colors ${
                      currentLanguage === lang.code
                        ? 'bg-sky-500/20 text-sky-300 font-bold'
                        : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </div>
                    {currentLanguage === lang.code && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
