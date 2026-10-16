import React from 'react';
import { LiveHazeMonitor } from './LiveHazeMonitor';
import { ItinerarySubstitutionEngine } from './ItinerarySubstitutionEngine';
import { RegionalPsiData, SingaporeRegion } from '../types/haze';
import { LocationMatchResult } from '../utils/locationResolver';
import { AppLanguage, TRANSLATIONS } from '../utils/i18n';
import { Sliders, Sparkles, CheckCircle2 } from 'lucide-react';

interface DualPageSplitViewProps {
  currentRegionData: RegionalPsiData;
  allRegionsData: Record<SingaporeRegion, RegionalPsiData>;
  selectedRegion: SingaporeRegion;
  onSelectRegion: (region: SingaporeRegion) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  userLocation: LocationMatchResult | null;
  onSetUserLocation: (loc: LocationMatchResult | null) => void;
  splitRatio: number; // e.g. 50 (50:50) or 35 (35:65)
  onSetSplitRatio: (ratio: number) => void;
  pageScale: number;
  language: AppLanguage;
  scaleByViewingEnabled: boolean;
  viewingProgressPercent: number;
}

export const DualPageSplitView: React.FC<DualPageSplitViewProps> = ({
  currentRegionData,
  allRegionsData,
  selectedRegion,
  onSelectRegion,
  onRefresh,
  isRefreshing,
  userLocation,
  onSetUserLocation,
  splitRatio,
  onSetSplitRatio,
  pageScale,
  language,
  scaleByViewingEnabled,
  viewingProgressPercent,
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Effective ratio: If scaleByViewingEnabled is true, dynamically adjust the split ratio
  // As the user explores the air monitor (viewing done increases), give more room to the itinerary!
  const effectiveLeftRatio = scaleByViewingEnabled
    ? Math.max(30, Math.min(70, Math.round(60 - (viewingProgressPercent / 100) * 25)))
    : splitRatio;
  const effectiveRightRatio = 100 - effectiveLeftRatio;

  return (
    <div className="space-y-4">
      {/* Dynamic Scaling Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-900 text-white text-xs border border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-bold">Dual Page Synchronized View:</span>
          <span className="text-slate-300">
            Page 1 (Air Monitor & Map) & Page 2 (Indoor Substitutions)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span>Split:</span>
            <span className="font-mono font-bold text-sky-400">
              {effectiveLeftRatio}% : {effectiveRightRatio}%
            </span>
          </div>

          <input
            type="range"
            min={25}
            max={75}
            value={effectiveLeftRatio}
            onChange={(e) => onSetSplitRatio(Number(e.target.value))}
            className="w-24 accent-sky-400 cursor-pointer"
            title="Drag to dynamically scale the two pages"
          />

          {scaleByViewingEnabled && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Auto-Scaled by Viewing</span>
            </span>
          )}
        </div>
      </div>

      {/* Side-by-side Dual Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Page: Air Quality & Google Map (Dynamically scaled) */}
        <div
          className="transition-all duration-300"
          style={{
            gridColumn: `span ${Math.max(3, Math.min(9, Math.round((effectiveLeftRatio / 100) * 12)))} / span ${Math.max(3, Math.min(9, Math.round((effectiveLeftRatio / 100) * 12)))}`,
          }}
        >
          <div className="sticky top-20 space-y-4">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  Page 1 · Live Regional Air Monitor
                </span>
              </div>
              <span className="font-mono text-xs font-semibold text-slate-500">
                {effectiveLeftRatio}% Width
              </span>
            </div>

            <LiveHazeMonitor
              currentRegionData={currentRegionData}
              allRegionsData={allRegionsData}
              selectedRegion={selectedRegion}
              onSelectRegion={onSelectRegion}
              onRefresh={onRefresh}
              isRefreshing={isRefreshing}
              onNavigateToItinerary={() => {}}
              onNavigateToSupplies={() => {}}
              onNavigateToEducation={() => {}}
              alertThresholdEnabled={true}
              onToggleAlertThreshold={() => {}}
              userLocation={userLocation}
              onSetUserLocation={onSetUserLocation}
            />
          </div>
        </div>

        {/* Right Page: Itinerary Substitution Engine (Dynamically scaled) */}
        <div
          className="transition-all duration-300"
          style={{
            gridColumn: `span ${Math.max(3, Math.min(9, Math.round((effectiveRightRatio / 100) * 12)))} / span ${Math.max(3, Math.min(9, Math.round((effectiveRightRatio / 100) * 12)))}`,
          }}
        >
          <div className="space-y-4">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                  Page 2 · Indoor Itinerary Substitution
                </span>
              </div>
              <span className="font-mono text-xs font-semibold text-slate-500">
                {effectiveRightRatio}% Width
              </span>
            </div>

            <ItinerarySubstitutionEngine />
          </div>
        </div>
      </div>
    </div>
  );
};
