import React, { useEffect, useState } from 'react';
import {
  CloudSun,
  CloudRain,
  CloudLightning,
  Sun,
  Cloud,
  Wind,
  RefreshCw,
  Clock,
  MapPin,
  AlertCircle,
  Sparkles,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface WeatherForecastItem {
  area: string;
  forecast: string;
  region: 'central' | 'south' | 'north' | 'east' | 'west';
}

export const WeatherWidget: React.FC<{ selectedRegion?: string }> = ({ selectedRegion }) => {
  const { t } = useLanguage();
  const [forecasts, setForecasts] = useState<WeatherForecastItem[]>([]);
  const [validPeriod, setValidPeriod] = useState<string>('Next 2 Hours');
  const [updateTime, setUpdateTime] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeWeatherModal, setActiveWeatherModal] = useState<WeatherForecastItem | null>(null);

  const fetchWeather = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/weather');
      if (!res.ok) {
        throw new Error(`Weather API returned status ${res.status}`);
      }
      const json = await res.json();
      const latestItem = json?.data?.items?.[0];

      if (latestItem && latestItem.forecasts) {
        const areaToRegion = (area: string): 'central' | 'south' | 'north' | 'east' | 'west' => {
          const a = area.toLowerCase();
          if (a.includes('sentosa') || a.includes('southern') || a.includes('bukit merah')) return 'south';
          if (a.includes('woodlands') || a.includes('yishun') || a.includes('mandai') || a.includes('sembawang')) return 'north';
          if (a.includes('changi') || a.includes('tampines') || a.includes('bedok') || a.includes('pasir ris')) return 'east';
          if (a.includes('jurong') || a.includes('clementi') || a.includes('tuas') || a.includes('bukit batok')) return 'west';
          return 'central';
        };

        const curatedAreas = [
          'City',
          'Southern Islands',
          'Sentosa',
          'Changi',
          'Mandai',
          'Jurong East',
          'Orchard',
          'Bishan',
          'Bedok',
          'Woodlands',
        ];

        const mapped: WeatherForecastItem[] = latestItem.forecasts
          .filter((f: any) => curatedAreas.some((c) => f.area.toLowerCase().includes(c.toLowerCase())))
          .map((f: any) => ({
            area: f.area,
            forecast: f.forecast,
            region: areaToRegion(f.area),
          }));

        setForecasts(mapped);

        if (latestItem.valid_period) {
          const start = new Date(latestItem.valid_period.start).toLocaleTimeString('en-SG', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
          const end = new Date(latestItem.valid_period.end).toLocaleTimeString('en-SG', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
          setValidPeriod(`${start} – ${end}`);
        }

        if (latestItem.update_timestamp) {
          setUpdateTime(
            new Date(latestItem.update_timestamp).toLocaleTimeString('en-SG', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })
          );
        }
      }
    } catch (err: any) {
      setError('Weather forecast temporarily unavailable.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 10 * 60 * 1000); // 10 minutes
    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (forecast: string) => {
    const f = forecast.toLowerCase();
    if (f.includes('thundery') || f.includes('lightning')) {
      return <CloudLightning className="w-5 h-5 text-amber-500" />;
    }
    if (f.includes('rain') || f.includes('shower')) {
      return <CloudRain className="w-5 h-5 text-sky-500" />;
    }
    if (f.includes('partly cloudy')) {
      return <CloudSun className="w-5 h-5 text-amber-400" />;
    }
    if (f.includes('cloud')) {
      return <Cloud className="w-5 h-5 text-slate-400" />;
    }
    return <Sun className="w-5 h-5 text-amber-400" />;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>{t('liveNeaFeed')}</span>
            <span aria-hidden="true">·</span>
            <span>{t('weatherSubtitle')}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
            {t('weatherHeadline')}
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1 font-medium bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Valid: {validPeriod}</span>
          </div>
          <button
            onClick={fetchWeather}
            disabled={isLoading}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Refresh forecast"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error ? (
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-slate-400" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {forecasts.map((item) => (
            <div
              key={item.area}
              onClick={() => setActiveWeatherModal(item)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                selectedRegion && item.region === selectedRegion
                  ? 'bg-sky-50/80 border-sky-300 dark:bg-sky-950/40 dark:border-sky-800'
                  : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {item.area}
                  </span>
                  {getWeatherIcon(item.forecast)}
                </div>
                <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block line-clamp-1">
                  {item.forecast}
                </span>
                <span className="text-[10px] text-slate-400 capitalize block mt-0.5">
                  {item.region} Sector
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveWeatherModal(item);
                }}
                className="w-full mt-2 py-1 px-2 rounded-lg bg-slate-900/10 dark:bg-white/10 hover:bg-slate-900/20 text-[10px] font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1 transition-colors"
              >
                <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                <span>{t('details')}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pop-up Modal for Weather Details */}
      {activeWeatherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
            <button
              onClick={() => setActiveWeatherModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 flex items-center justify-center">
                  {getWeatherIcon(activeWeatherModal.forecast)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {activeWeatherModal.area}
                  </h3>
                  <span className="text-xs text-sky-600 dark:text-sky-400 font-semibold uppercase tracking-wider">
                    {activeWeatherModal.region} Sector Forecast
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs text-slate-700 dark:text-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Sky Forecast:</span>
                  <strong className="text-slate-900 dark:text-white">{activeWeatherModal.forecast}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Valid Window:</span>
                  <span className="font-mono">{validPeriod}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Haze & Rain Interaction Tip:</span>
                </span>
                <p className="text-[11px] leading-relaxed">
                  Tropical rain showers effectively scrub airborne PM2.5 particles from the air, temporarily improving ambient visibility.
                </p>
              </div>

              <button
                onClick={() => setActiveWeatherModal(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs hover:bg-slate-800 flex items-center justify-center transition-all"
              >
                <span>{t('close')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
