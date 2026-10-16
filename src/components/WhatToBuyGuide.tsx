import React, { useState } from 'react';
import {
  ShoppingBag,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Phone,
  ExternalLink,
  ShieldAlert,
  Sparkles,
  X,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { MEDICAL_SUPPLIES, PHARMACY_CHAINS, IMAGES } from '../data/hazeData';
import { MedicalSupplyItem, PharmacyChain } from '../types/haze';
import { useLanguage } from '../context/LanguageContext';

export const WhatToBuyGuide: React.FC = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeSupplyModal, setActiveSupplyModal] = useState<MedicalSupplyItem | null>(null);
  const [activePharmacyModal, setActivePharmacyModal] = useState<PharmacyChain | null>(null);

  const categories = [
    'All',
    'Respiratory Protection',
    'Eye Care',
    'Throat & Nasal',
    'Medication & Devices',
  ];

  const filteredSupplies = MEDICAL_SUPPLIES.filter(
    (item) => selectedCategory === 'All' || item.category === selectedCategory
  );

  const SUPPLY_SHORT_SUMMARIES: Record<string, string> = {
    '3m-aura-n95': 'Filters ninety-five percent fine smoke particles.', // 6 words
    'refresh-eye-drops': 'Soothes irritated eyes from airborne smoke.', // 6 words
    'sterimar-nasal-spray': 'Flushes airborne smoke particles from nostrils.', // 6 words
    'philips-air-purifier': 'Cleans hotel room air while sleeping.', // 6 words
    'difflam-throat-spray': 'Eases scratchy throat and tickle cough.', // 6 words
    '3m-half-facepiece-respirator': 'Heavy particulate protection for outdoor commuters.', // 6 words
  };

  const PHARMACY_SHORT_SUMMARIES: Record<string, string> = {
    'Guardian Health & Beauty': 'Airport and MRT pharmacies with pharmacists.', // 6 words
    'Watsons Singapore': 'Islandwide wellness stores with haze supplies.', // 6 words
    'Unity Pharmacy (FairPrice Group)': 'Community pharmacies with fair regulated prices.', // 6 words
    'Mustafa Centre Pharmacy': 'Twenty-four-hour Little India superstore with masks.', // 6 words
  };

  return (
    <div className="space-y-8">
      {/* Visual Billboard with 3M Aura N95 Studio Feature */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/90 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-900 dark:text-white">Pillar 2</span>
              <span aria-hidden="true">·</span>
              <span>Essential Tourist Haze Kit</span>
              <span aria-hidden="true">·</span>
              <span>Regulated Prices</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              {t('pillar2Title')}
            </h1>

            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              {t('pillar2Desc')}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-slate-900 dark:text-white">Price Regulated:</span>
              <span className="text-slate-600 dark:text-slate-300">Standard SGD retail pricing enforced across all national chains</span>
            </div>
          </div>

          <div className="lg:col-span-5 relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 shadow-inner group">
            <img
              src={IMAGES.n95Studio}
              alt="Certified 3M Aura N95 Respirator"
              referrerPolicy="no-referrer"
              className="w-full h-64 object-contain p-4 group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute bottom-3 left-3 right-3 p-2.5 rounded-xl bg-slate-950/80 backdrop-blur-md text-white text-[11px] flex items-center justify-between">
              <span className="font-semibold">3M Aura 9320A+ / 9205+</span>
              <span className="text-emerald-400 font-bold">NIOSH Certified N95</span>
            </div>
          </div>
        </div>
      </section>

      {/* Product Catalog Cards (5-7 Words per Card Face with Details Popup) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Recommended Singapore Tourist Haze Kit
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Available over-the-counter across authorized retail pharmacies
            </p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSupplies.map((item) => {
            const shortSummary = SUPPLY_SHORT_SUMMARIES[item.id] || 'Protective health essential for smoke haze.';

            return (
              <div
                key={item.id}
                onClick={() => setActiveSupplyModal(item)}
                className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-md transition-all flex flex-col justify-between space-y-3 cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
                    <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">
                      {item.category}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                      {item.singaporePriceSgd}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-2 leading-snug">
                    {item.name}
                  </h3>

                  {/* 5-7 Words Information */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                      {t('summary')}
                    </span>
                    <p className="font-medium leading-snug">
                      {shortSummary}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Stock: <strong className="text-emerald-600 dark:text-emerald-400">{item.stockAvailability}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSupplyModal(item);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all"
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>{t('details')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Major Pharmacy Chains & 24/7 Outlets (5-7 Words per Card Face with Details Popup) */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Where to Buy: Major Pharmacy Chains & 24/7 Outlets
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Airport, town, and MRT station branches with registered pharmacists on duty
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PHARMACY_CHAINS.map((chain) => {
            const shortSummary = PHARMACY_SHORT_SUMMARIES[chain.name] || 'Islandwide pharmacies with licensed pharmacists.';

            return (
              <div
                key={chain.name}
                onClick={() => setActivePharmacyModal(chain)}
                className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all flex flex-col justify-between space-y-4 cursor-pointer"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">{chain.name}</h3>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{chain.outletCount}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{chain.operatingHours}</span>
                  </div>

                  {/* 5-7 Words Information */}
                  <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 text-xs">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
                      {t('summary')}
                    </span>
                    <p className="font-medium text-slate-800 dark:text-slate-200 leading-snug">
                      {shortSummary}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700 flex items-center justify-between text-xs">
                  <a
                    href={`tel:${chain.hotline.replace(/\s+/g, '')}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 font-bold text-slate-900 dark:text-white hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{chain.hotline}</span>
                  </a>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActivePharmacyModal(chain);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-all"
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>{t('details')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pop-up Modal for Medical Supply Item Details */}
      {activeSupplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveSupplyModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center justify-between pr-8">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {activeSupplyModal.category}
                </span>
                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                  {activeSupplyModal.singaporePriceSgd}
                </span>
              </div>

              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {activeSupplyModal.name}
              </h3>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">Why Tourists Need This:</span>
                {activeSupplyModal.whyNeeded}
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Top Recommended Brands:</span>
                  <span className="text-slate-600 dark:text-slate-300">{activeSupplyModal.recommendedBrands.join(', ')}</span>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white block mb-0.5">Medical Advice & Usage:</span>
                  <span className="text-slate-600 dark:text-slate-300">{activeSupplyModal.usageAdvice}</span>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">Stock Availability:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{activeSupplyModal.stockAvailability}</span>
                </div>
              </div>

              <button
                onClick={() => setActiveSupplyModal(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-all"
              >
                <span>{t('close')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up Modal for Pharmacy Chain Details */}
      {activePharmacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActivePharmacyModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center justify-between pr-8">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {activePharmacyModal.name}
                </h3>
                <span className="text-xs font-semibold text-slate-500">{activePharmacyModal.outletCount}</span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Operating Hours: <strong>{activePharmacyModal.operatingHours}</strong></span>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Key Tourist Outlets:
                </span>
                <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-200">
                  {activePharmacyModal.popularTouristOutlets.map((loc, i) => (
                    <li key={i} className="flex items-start gap-2 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                      <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0 mt-0.5" />
                      <span>{loc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <a
                  href={`tel:${activePharmacyModal.hotline.replace(/\s+/g, '')}`}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs text-center flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {activePharmacyModal.hotline}</span>
                </a>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    activePharmacyModal.name + ' Singapore'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Locate Outlets</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
