import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  Search,
  Navigation,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  Stethoscope,
  BookOpen,
  Sparkles,
  PhoneCall,
  Activity,
  CheckCircle2,
  AlertTriangle,
  X,
  ExternalLink,
} from 'lucide-react';
import { RegionalPsiData, SingaporeRegion } from '../types/haze';
import { IMAGES, ITINERARY_SUBSTITUTIONS } from '../data/hazeData';
import { SingaporeRegionalMap } from './SingaporeRegionalMap';
import { resolveSingaporeLocation, resolveCoordinatesToRegion, LocationMatchResult } from '../utils/locationResolver';
import { useLanguage } from '../context/LanguageContext';

interface HomeOverviewProps {
  currentRegionData: RegionalPsiData;
  allRegionsData: Record<SingaporeRegion, RegionalPsiData>;
  selectedRegion: SingaporeRegion;
  onSelectRegion: (region: SingaporeRegion) => void;
  onNavigateToTab: (tab: 'live' | 'itinerary' | 'supplies' | 'health' | 'education') => void;
  userLocation: LocationMatchResult | null;
  onSetUserLocation: (loc: LocationMatchResult | null) => void;
}

export const HomeOverview: React.FC<HomeOverviewProps> = ({
  currentRegionData,
  allRegionsData,
  selectedRegion,
  onSelectRegion,
  onNavigateToTab,
  userLocation,
  onSetUserLocation,
}) => {
  const { t } = useLanguage();
  const [searchInput, setSearchInput] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [activePillarModal, setActivePillarModal] = useState<'pillar1' | 'pillar2' | 'pillar3' | 'pillar4' | null>(null);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchInput.trim()) return;

    const matched = resolveSingaporeLocation(searchInput);
    onSetUserLocation(matched);
    onSelectRegion(matched.region);
  };

  const handleSelectPreset = (presetName: string) => {
    setSearchInput(presetName);
    const matched = resolveSingaporeLocation(presetName);
    onSetUserLocation(matched);
    onSelectRegion(matched.region);
  };

  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        const region = resolveCoordinatesToRegion(latitude, longitude);
        const matched: LocationMatchResult = {
          query: 'My Current Location',
          matchedName: 'GPS Detected Location',
          region,
          regionDisplayName: `${region.toUpperCase()} Singapore`,
          coordinates: { lat: latitude, lng: longitude },
          note: 'Located via browser GPS',
        };
        onSetUserLocation(matched);
        onSelectRegion(region);
        setSearchInput('My Current Location');
      },
      (err) => {
        setIsLocating(false);
        console.warn('Geolocation error:', err);
        // Fallback to central
        handleSelectPreset('Marina Bay Sands');
      },
      { timeout: 7000 }
    );
  };

  const quickPresets = [
    { label: 'Marina Bay Sands', sub: 'Central' },
    { label: 'Sentosa / Universal Studios', sub: 'South' },
    { label: 'Orchard Road', sub: 'Central' },
    { label: 'Changi Airport / Jewel', sub: 'East' },
    { label: 'Singapore Zoo / Mandai', sub: 'North' },
    { label: 'Science Centre / Jurong', sub: 'West' },
  ];

  return (
    <div className="space-y-10">
      {/* 1. Hero Search & Location Intelligence Header */}
      <section className="relative rounded-3xl overflow-hidden border border-slate-200 bg-slate-950 text-white shadow-xl">
        <div className="absolute inset-0">
          <img
            src={IMAGES.skyline}
            alt="Singapore Marina Bay Skyline"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-40 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900/40" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 lg:p-12 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs text-slate-200 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{t('appName')} · {t('appTagline')}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4 leading-tight">
            {t('heroTitle')}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mb-8">
            {t('heroSubtitle')}
          </p>

          {/* Location Search Bar */}
          <div className="bg-white/10 backdrop-blur-md p-2 sm:p-3 rounded-2xl border border-white/20 shadow-lg max-w-2xl">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm rounded-xl bg-slate-900/80 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleUseGeolocation}
                  disabled={isLocating}
                  className="px-3.5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/20 transition-all shrink-0"
                  title="Detect GPS Location"
                >
                  <Navigation className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{t('detectGps')}</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-white text-slate-950 text-xs sm:text-sm font-bold hover:bg-slate-100 transition-all shadow-md shrink-0"
                >
                  {t('findMyZone')}
                </button>
              </div>
            </form>

            {/* Quick Popular Presets */}
            <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] text-slate-300 font-medium mr-1">{t('popularSpots')}</span>
              {quickPresets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleSelectPreset(preset.label)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium transition-colors border border-white/10"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Location Match Confirmation Box */}
          {userLocation && (
            <div className="mt-4 p-4 rounded-2xl bg-slate-900/90 border border-white/20 backdrop-blur-md max-w-2xl flex items-center justify-between gap-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0 border border-sky-400/30">
                  <MapPin className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">{t('locationMatched')}</span>
                    <strong className="text-white text-sm">{userLocation.matchedName}</strong>
                  </div>
                  <div className="text-xs text-sky-300 font-semibold mt-0.5">
                    {t('assignedTo')} {userLocation.region.toUpperCase()} Zone · 24-hr PSI: {allRegionsData[userLocation.region]?.psi24Hourly ?? '--'} ({allRegionsData[userLocation.region]?.status ?? 'Mod'})
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigateToTab('live')}
                className="px-3.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs text-white font-semibold transition-colors shrink-0"
              >
                {t('viewFullReading')}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 2. Visual Regional Map & Air Status Dashboard */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              <span>{t('liveNeaFeed')}</span>
              <span aria-hidden="true">·</span>
              <span>data.gov.sg Real-Time</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              {t('airQualityBySector')}
            </h2>
          </div>

          <button
            onClick={() => onNavigateToTab('live')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-sky-400 hover:text-slate-700 transition-colors"
          >
            <span>{t('viewFullReading')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* High-Accuracy SVG Regional Map Component */}
        <SingaporeRegionalMap
          selectedRegion={selectedRegion}
          allRegionsData={allRegionsData}
          onSelectRegion={onSelectRegion}
          userLocationName={userLocation?.matchedName}
          userCoordinates={userLocation?.coordinates}
        />
      </section>

      {/* 3. Four Core Highlight Pillars (Simplified to 5-7 words per card face with Details popup) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar 1: Itinerary Substitution */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 transition-colors">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                <span>Pillar 1 · Holiday Contingency</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-400">100% Sheltered</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('pillar1Title')}
            </h3>

            {/* 5-7 Words Information */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                {t('summary')}
              </span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                {t('pillar1Short')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActivePillarModal('pillar1')}
            className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{t('details')}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        {/* Pillar 2: What to Buy & Pharmacy Highlight */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 transition-colors">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4" />
                <span>Pillar 2 · Essential Haze Kit</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-400">Official Stockists</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('pillar2Title')}
            </h3>

            {/* 5-7 Words Information */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                {t('summary')}
              </span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                {t('pillar2Short')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActivePillarModal('pillar2')}
            className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{t('details')}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        {/* Pillar 3: Medical & SOS Help Highlight */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 transition-colors">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4" />
                <span>Pillar 3 · Health & Clinics</span>
              </span>
              <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400">SCDF 995</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {t('pillar3Title')}
            </h3>

            {/* 5-7 Words Information */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                {t('summary')}
              </span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                {t('pillar3Short')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActivePillarModal('pillar3')}
            className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{t('details')}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>

        {/* Pillar 4: Science & Haze 101 Highlight */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 transition-colors">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                <span>Pillar 4 · What is Haze?</span>
              </span>
              <span className="text-[11px] font-semibold text-slate-400">NEA Standards</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Understanding Southeast Asian Smoke Haze
            </h3>

            {/* 5-7 Words Information */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                {t('summary')}
              </span>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-snug">
                {t('pillar4Short')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActivePillarModal('pillar4')}
            className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{t('details')}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
          </button>
        </div>
      </div>

      {/* Pop-up Modals for Pillar Details */}
      {activePillarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActivePillarModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {activePillarModal === 'pillar1' && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                  <Compass className="w-4 h-4" />
                  <span>Pillar 1 Details · 100% Sheltered Sanctuaries</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {t('pillar1Title')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t('pillar1Desc')}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video relative">
                    <img src={IMAGES.cloudForest} alt="Cloud Forest" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1.5 text-[10px] font-bold text-white drop-shadow">Cloud Forest</span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video relative">
                    <img src={IMAGES.jewel} alt="Jewel Changi" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1.5 text-[10px] font-bold text-white drop-shadow">Jewel Changi</span>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-video relative">
                    <img src={IMAGES.aquarium} alt="S.E.A. Aquarium" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1.5 text-[10px] font-bold text-white drop-shadow">S.E.A. Aquarium</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActivePillarModal(null);
                    onNavigateToTab('itinerary');
                  }}
                  className="w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs hover:bg-slate-800 flex items-center justify-center gap-2"
                >
                  <span>{t('exploreSubstitutions')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {activePillarModal === 'pillar2' && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Pillar 2 Details · Certified Protection & Outlets</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {t('pillar2Title')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t('pillar2Desc')}
                </p>
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-950 dark:text-amber-200 space-y-1">
                  <span className="font-bold block">Tourist Recommended Kit:</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-amber-200">3M Aura N95 Mask</span>
                    <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-amber-200">Preservative-Free Tears</span>
                    <span className="bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-amber-200">Sterile Saline Spray</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActivePillarModal(null);
                    onNavigateToTab('supplies');
                  }}
                  className="w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs hover:bg-slate-800 flex items-center justify-center gap-2"
                >
                  <span>{t('viewSupplies')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {activePillarModal === 'pillar3' && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
                  <Stethoscope className="w-4 h-4" />
                  <span>Pillar 3 Details · Emergency Services & Clinics</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {t('pillar3Title')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t('pillar3Desc')}
                </p>
                <div className="flex items-center gap-3">
                  <a
                    href="tel:995"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs text-center flex items-center justify-center gap-1.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
                    <span>{t('ambulanceCall')}</span>
                  </a>
                  <a
                    href="tel:1777"
                    className="flex-1 py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs text-center"
                  >
                    {t('nonEmergencyCall')}
                  </a>
                </div>
                <button
                  onClick={() => {
                    setActivePillarModal(null);
                    onNavigateToTab('health');
                  }}
                  className="w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs hover:bg-slate-800 flex items-center justify-center gap-2"
                >
                  <span>{t('viewClinics')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {activePillarModal === 'pillar4' && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-sky-600 font-bold text-xs uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  <span>Pillar 4 Details · The Science of Smoke Haze</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Understanding Southeast Asian Smoke Haze
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Learn about peatland fires, seasonal monsoon wind patterns, and why 1-hour PM2.5 readings provide immediate guidance on outdoor walking safety.
                </p>
                <button
                  onClick={() => {
                    setActivePillarModal(null);
                    onNavigateToTab('education');
                  }}
                  className="w-full py-3 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs hover:bg-slate-800 flex items-center justify-center gap-2"
                >
                  <span>Read Complete Educational Guide</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
