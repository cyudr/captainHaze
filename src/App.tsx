/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Navbar, AppTab } from './components/Navbar';
import { HomeOverview } from './components/HomeOverview';
import { LiveHazeMonitor } from './components/LiveHazeMonitor';
import { ItinerarySubstitutionEngine } from './components/ItinerarySubstitutionEngine';
import { WhatToBuyGuide } from './components/WhatToBuyGuide';
import { SymptomAndHelpCenter } from './components/SymptomAndHelpCenter';
import { HazeEducationGuide } from './components/HazeEducationGuide';
import { HazeSimulatorModal } from './components/HazeSimulatorModal';
import { HazeAlertBanner } from './components/HazeAlertBanner';
import { Footer } from './components/Footer';
import { ViewModeController, ViewMode, ViewingProgressState } from './components/ViewModeController';
import { MobileDeviceFrame } from './components/MobileDeviceFrame';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DualPageSplitView } from './components/DualPageSplitView';
import { fetchLiveSingaporePsi } from './services/psiService';
import { RegionalPsiData, SingaporeRegion } from './types/haze';
import { FALLBACK_PSI_DATA } from './data/hazeData';
import { LocationMatchResult } from './utils/locationResolver';
import { ThemeMode, getInitialTheme, applyTheme } from './utils/theme';
import { AppLanguage, getInitialLanguage, saveLanguage } from './utils/i18n';
import { useDeviceDetection } from './utils/useDeviceDetection';
import { LanguageProvider } from './context/LanguageContext';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('overview');
  const [selectedRegion, setSelectedRegion] = useState<SingaporeRegion>('central');
  const [userLocation, setUserLocation] = useState<LocationMatchResult | null>({
    query: 'Marina Bay Sands',
    matchedName: 'Marina Bay & Bayfront',
    region: 'central',
    regionDisplayName: 'Central Singapore',
    note: 'Popular Tourist Landmark',
  });
  const [regionsData, setRegionsData] = useState<Record<SingaporeRegion, RegionalPsiData>>(
    FALLBACK_PSI_DATA as Record<SingaporeRegion, RegionalPsiData>
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLiveFeed, setIsLiveFeed] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [simulatedPsi, setSimulatedPsi] = useState<number | null>(null);
  const [alertThresholdEnabled, setAlertThresholdEnabled] = useState(true);

  // Auto Device Detection
  const deviceInfo = useDeviceDetection();

  // View Mode & Dynamic Scaling States
  const [viewMode, setViewMode] = useState<ViewMode>('responsive');
  const [pageScale, setPageScale] = useState<number>(1);
  const [splitRatio, setSplitRatio] = useState<number>(50);
  const [scaleByViewingEnabled, setScaleByViewingEnabled] = useState<boolean>(true);

  // Viewing Done Tracking State
  const [viewingProgress, setViewingProgress] = useState<ViewingProgressState>({
    viewedRegions: ['central'],
    viewedAttractions: ['gardens-by-the-bay', 'jewel-changi'],
    viewedGuides: ['n95-fit'],
    totalTrackableItems: 16,
  });

  // Dark / Light Mode with Time-based default
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialTheme());

  // Internationalization Language State
  const [language, setLanguage] = useState<AppLanguage>(getInitialLanguage());

  // Apply theme on mount and when themeMode changes
  useEffect(() => {
    applyTheme(themeMode);
  }, [themeMode]);

  const handleSetLanguage = (newLang: AppLanguage) => {
    setLanguage(newLang);
    saveLanguage(newLang);
  };

  const markRegionViewed = (region: SingaporeRegion) => {
    setSelectedRegion(region);
    setViewingProgress((prev) => {
      if (prev.viewedRegions.includes(region)) return prev;
      return {
        ...prev,
        viewedRegions: [...prev.viewedRegions, region],
      };
    });
  };

  const loadPsiData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetchLiveSingaporePsi();
      if (res.data) {
        setRegionsData(res.data);
      }
      setIsLiveFeed(res.isLive);
    } catch (err) {
      console.error('Error fetching live PSI:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadPsiData();
    const interval = setInterval(loadPsiData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute active region data, incorporating simulator override if active
  const baseRegionData = regionsData[selectedRegion] || regionsData['national'];
  const effectivePsi = simulatedPsi !== null ? simulatedPsi : baseRegionData.psi24Hourly;

  const determineStatus = (psi: number): RegionalPsiData['status'] => {
    if (psi <= 50) return 'Good';
    if (psi <= 100) return 'Moderate';
    if (psi <= 200) return 'Unhealthy';
    if (psi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  const effectiveRegionData: RegionalPsiData = {
    ...baseRegionData,
    psi24Hourly: effectivePsi,
    status: determineStatus(effectivePsi),
    description:
      simulatedPsi !== null
        ? `[SIMULATED SCENARIO] Air quality is in the ${determineStatus(effectivePsi)} band (PSI ${effectivePsi}). Testing tourist advisory responses.`
        : baseRegionData.description,
  };

  const handleApplySimulation = (psi: number | null) => {
    setSimulatedPsi(psi);
  };

  const totalViewed =
    viewingProgress.viewedRegions.length +
    viewingProgress.viewedAttractions.length +
    viewingProgress.viewedGuides.length;
  const viewingPercent = Math.min(
    100,
    Math.round((totalViewed / Math.max(1, viewingProgress.totalTrackableItems)) * 100)
  );

  // Render the core page content
  const renderPageContent = () => {
    if (viewMode === 'dual') {
      return (
        <DualPageSplitView
          currentRegionData={effectiveRegionData}
          allRegionsData={regionsData}
          selectedRegion={selectedRegion}
          onSelectRegion={markRegionViewed}
          onRefresh={loadPsiData}
          isRefreshing={isRefreshing}
          userLocation={userLocation}
          onSetUserLocation={setUserLocation}
          splitRatio={splitRatio}
          onSetSplitRatio={setSplitRatio}
          pageScale={pageScale}
          language={language}
          scaleByViewingEnabled={scaleByViewingEnabled}
          viewingProgressPercent={viewingPercent}
        />
      );
    }

    return (
      <>
        {activeTab === 'overview' && (
          <HomeOverview
            currentRegionData={effectiveRegionData}
            allRegionsData={regionsData}
            selectedRegion={selectedRegion}
            onSelectRegion={markRegionViewed}
            onNavigateToTab={(tab) => setActiveTab(tab)}
            userLocation={userLocation}
            onSetUserLocation={setUserLocation}
          />
        )}

        {activeTab === 'live' && (
          <LiveHazeMonitor
            currentRegionData={effectiveRegionData}
            allRegionsData={regionsData}
            selectedRegion={selectedRegion}
            onSelectRegion={markRegionViewed}
            onRefresh={loadPsiData}
            isRefreshing={isRefreshing}
            onNavigateToItinerary={() => setActiveTab('itinerary')}
            onNavigateToSupplies={() => setActiveTab('supplies')}
            onNavigateToEducation={() => setActiveTab('education')}
            alertThresholdEnabled={alertThresholdEnabled}
            onToggleAlertThreshold={() => setAlertThresholdEnabled(!alertThresholdEnabled)}
            userLocation={userLocation}
            onSetUserLocation={setUserLocation}
          />
        )}

        {activeTab === 'itinerary' && <ItinerarySubstitutionEngine currentPsi={effectivePsi} status={effectiveRegionData.status} />}

        {activeTab === 'supplies' && <WhatToBuyGuide />}

        {activeTab === 'health' && <SymptomAndHelpCenter />}

        {activeTab === 'education' && <HazeEducationGuide />}
      </>
    );
  };

  return (
    <LanguageProvider initialLanguage={language} onLanguageChange={handleSetLanguage}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 transition-colors duration-200 selection:bg-slate-900 selection:text-white dark:selection:bg-sky-500">
        {/* Top View Controller Bar: Mode switcher, scale, theme, language, device detection */}
        <ViewModeController
          viewMode={viewMode}
          onSetViewMode={setViewMode}
          pageScale={pageScale}
          onSetPageScale={setPageScale}
          splitRatio={splitRatio}
          onSetSplitRatio={setSplitRatio}
          scaleByViewingEnabled={scaleByViewingEnabled}
          onToggleScaleByViewing={() => setScaleByViewingEnabled(!scaleByViewingEnabled)}
          viewingProgress={viewingProgress}
          themeMode={themeMode}
          onSetThemeMode={setThemeMode}
          currentLanguage={language}
          onSetLanguage={handleSetLanguage}
          isSimulating={simulatedPsi !== null}
          onOpenSimulator={() => setSimulatorOpen(true)}
          simulatedPsi={simulatedPsi ?? effectivePsi}
          deviceInfo={deviceInfo}
        />

        {/* Top Advisory Banner (Active when PSI > 100) */}
        <HazeAlertBanner
          psi={effectivePsi}
          status={effectiveRegionData.status}
          onNavigateToItinerary={() => setActiveTab('itinerary')}
          onNavigateToSupplies={() => setActiveTab('supplies')}
        />

        {/* Primary Top Bar */}
        <Navbar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenSimulator={() => setSimulatorOpen(true)}
          isSimulating={simulatedPsi !== null}
          simulatedPsi={simulatedPsi ?? effectivePsi}
        />

        {/* Main Viewport Container */}
        <main className={`flex-1 max-w-7xl w-full mx-auto ${deviceInfo.isMobile ? 'px-3 py-4' : 'px-4 sm:px-6 py-6 sm:py-8'}`}>
          {viewMode === 'mobile' ? (
            <MobileDeviceFrame
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              language={language}
              pageScale={pageScale}
              onExitMobilePreview={() => setViewMode('responsive')}
            >
              {renderPageContent()}
            </MobileDeviceFrame>
          ) : (
            <div
              className="transition-transform duration-300 origin-top"
              style={{
                transform: pageScale !== 1 && viewMode !== 'dual' ? `scale(${pageScale})` : undefined,
              }}
            >
              {renderPageContent()}
            </div>
          )}
        </main>

        {/* Footer */}
        <Footer onSelectTab={(tab) => setActiveTab(tab)} />

        {/* Mobile Fixed Bottom Navigation (Auto adapted for actual mobile devices or small screens) */}
        <div className={deviceInfo.isMobile ? 'block' : 'md:hidden'}>
          {viewMode !== 'mobile' && (
            <MobileBottomNav
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              language={language}
            />
          )}
        </div>

        {/* Interactive Scenario Simulator Modal */}
        <HazeSimulatorModal
          isOpen={simulatorOpen}
          onClose={() => setSimulatorOpen(false)}
          isSimulating={simulatedPsi !== null}
          simulatedPsi={simulatedPsi ?? 75}
          onApplySimulation={handleApplySimulation}
        />
      </div>
    </LanguageProvider>
  );
}
