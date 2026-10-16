import React, { useState, useEffect } from 'react';
import { RegionalPsiData, SingaporeRegion } from '../types/haze';
import {
  MapPin,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ExternalLink,
  ShieldCheck,
  Building2,
  Compass,
  Layers,
  X,
  Navigation,
  Sparkles,
} from 'lucide-react';
import { TouristAttraction, CURATED_TOURIST_ATTRACTIONS } from '../../api/tourist';
import { useLanguage } from '../context/LanguageContext';

interface SingaporeRegionalMapProps {
  selectedRegion: SingaporeRegion;
  allRegionsData: Record<SingaporeRegion, RegionalPsiData>;
  onSelectRegion: (region: SingaporeRegion) => void;
  userLocationName?: string;
  userCoordinates?: { lat: number; lng: number };
}

// Bounding box for Singapore Island:
// Longitude: 103.60 (Tuas South) to 104.04 (Changi Coast) = span 0.44
// Latitude: 1.20 (Southern Islands) to 1.48 (Woodlands / Johor Strait) = span 0.28
const MIN_LNG = 103.60;
const MAX_LNG = 104.04;
const MIN_LAT = 1.20;
const MAX_LAT = 1.48;

export function geoToSvg(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 1000;
  const y = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * 620;
  return {
    x: Math.min(Math.max(x, 15), 985),
    y: Math.min(Math.max(y, 15), 605),
  };
}

export const SingaporeRegionalMap: React.FC<SingaporeRegionalMapProps> = ({
  selectedRegion,
  allRegionsData,
  onSelectRegion,
  userLocationName,
  userCoordinates,
}) => {
  const { t } = useLanguage();
  const [mapMode, setMapMode] = useState<'map' | 'satellite'>('map');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedAttraction, setSelectedAttraction] = useState<TouristAttraction | null>(null);
  const [activeAttractionModal, setActiveAttractionModal] = useState<TouristAttraction | null>(null);
  const [attractions, setAttractions] = useState<TouristAttraction[]>(CURATED_TOURIST_ATTRACTIONS);
  const [filterIndoorOnly, setFilterIndoorOnly] = useState<boolean>(false);
  const [hoveredRegion, setHoveredRegion] = useState<SingaporeRegion | null>(null);

  // Fetch STB tourist attractions from /api/tourist
  useEffect(() => {
    let isMounted = true;
    fetch('/api/tourist')
      .then((res) => res.json())
      .then((res) => {
        if (isMounted && res.data && Array.isArray(res.data) && res.data.length > 0) {
          setAttractions(res.data);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleAttractions = attractions.filter((a) => {
    if (filterIndoorOnly && !a.isIndoor) return false;
    return true;
  });

  // Calculate sector color based on live PSI
  const getSectorFill = (regionId: SingaporeRegion, isSelected: boolean, isHovered: boolean) => {
    const psi = allRegionsData[regionId]?.psi24Hourly ?? 70;
    let baseColor = '#0ea5e9';

    if (psi <= 50) baseColor = '#10b981';
    else if (psi <= 100) baseColor = '#0284c7';
    else if (psi <= 200) baseColor = '#f59e0b';
    else if (psi <= 300) baseColor = '#ea580c';
    else baseColor = '#e11d48';

    return {
      fill: isSelected ? baseColor : '#ffffff',
      opacity: isSelected ? 0.22 : isHovered ? 0.12 : 0.02,
      stroke: isSelected ? '#1a73e8' : isHovered ? '#4285f4' : '#cbd5e1',
      strokeWidth: isSelected ? 2.5 : 1,
    };
  };

  // Geographic regional boundaries mapped across Singapore
  const sectors = [
    {
      id: 'north' as SingaporeRegion,
      name: 'North Region',
      labelLat: 1.42,
      labelLng: 103.82,
      path: 'M 350,195 L 390,130 L 450,85 L 530,65 L 610,75 L 670,120 L 685,160 L 610,210 L 525,230 L 450,225 L 390,210 Z',
    },
    {
      id: 'west' as SingaporeRegion,
      name: 'West Region',
      labelLat: 1.34,
      labelLng: 103.71,
      path: 'M 140,430 L 70,390 L 105,330 L 175,270 L 260,230 L 350,195 L 390,210 L 410,270 L 390,375 L 340,420 L 280,450 L 190,440 Z',
    },
    {
      id: 'central' as SingaporeRegion,
      name: 'Central Region',
      labelLat: 1.30,
      labelLng: 103.83,
      path: 'M 410,270 L 450,225 L 525,230 L 610,210 L 635,270 L 640,360 L 590,410 L 530,440 L 460,420 L 390,375 Z',
    },
    {
      id: 'east' as SingaporeRegion,
      name: 'East Region',
      labelLat: 1.36,
      labelLng: 103.94,
      path: 'M 610,210 L 685,160 L 760,175 L 850,210 L 920,250 L 945,300 L 900,345 L 820,380 L 730,395 L 640,360 L 635,270 Z',
    },
    {
      id: 'south' as SingaporeRegion,
      name: 'South Region',
      labelLat: 1.25,
      labelLng: 103.82,
      path: 'M 460,420 L 530,440 L 590,410 L 580,470 L 550,540 L 490,565 L 430,545 L 415,480 Z',
    },
  ];

  // User location marker
  const userPin = userCoordinates
    ? geoToSvg(userCoordinates.lat, userCoordinates.lng)
    : userLocationName?.toLowerCase().includes('sentosa')
    ? geoToSvg(1.254, 103.824)
    : userLocationName?.toLowerCase().includes('changi')
    ? geoToSvg(1.36, 103.99)
    : userLocationName?.toLowerCase().includes('zoo')
    ? geoToSvg(1.404, 103.793)
    : userLocationName?.toLowerCase().includes('jurong')
    ? geoToSvg(1.333, 103.744)
    : geoToSvg(1.284, 103.859);

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg bg-[#aad3df] dark:bg-[#17263c] transition-colors select-none font-sans">
      {/* Top Left: Google Maps Style Layer Switcher & HEPA Filter */}
      <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-2">
        <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200/90 dark:border-slate-800 p-0.5 text-xs font-semibold">
          <button
            onClick={() => setMapMode('map')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              mapMode === 'map'
                ? 'bg-[#1a73e8] text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Map
          </button>
          <button
            onClick={() => setMapMode('satellite')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              mapMode === 'satellite'
                ? 'bg-[#1a73e8] text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Satellite
          </button>
        </div>

        <button
          onClick={() => setFilterIndoorOnly(!filterIndoorOnly)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md border transition-all ${
            filterIndoorOnly
              ? 'bg-emerald-600 text-white border-emerald-700'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-800 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Indoor HEPA Only ({visibleAttractions.length})</span>
        </button>
      </div>

      {/* Top Right: Google Maps Zoom In / Zoom Out Controls */}
      <div className="absolute top-3.5 right-3.5 z-20 flex flex-col items-end gap-1.5">
        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200/90 dark:border-slate-800 overflow-hidden text-slate-700 dark:text-slate-200">
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.25))}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 1))}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {zoomLevel !== 1 && (
          <button
            onClick={() => setZoomLevel(1)}
            className="px-2 py-0.5 rounded-lg bg-white/95 dark:bg-slate-900/95 text-[10px] font-bold shadow-md border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
          >
            Reset
          </button>
        )}
      </div>

      {/* SVG Google Maps Realistic Canvas */}
      <div className="relative w-full aspect-[16/10] min-h-[380px] max-h-[520px] overflow-hidden flex items-center justify-center">
        <svg
          viewBox="0 0 1000 620"
          className="w-full h-full transition-transform duration-300 ease-out origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <defs>
            {/* Soft shadow for Google Maps markers */}
            <filter id="markerShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
            </filter>
            <pattern id="cityGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" className="dark:stroke-slate-800/40" />
            </pattern>
          </defs>

          {/* 1. Base Sea Water Canvas (Google Maps Soft Ocean Blue) */}
          <rect
            width="1000"
            height="620"
            fill={mapMode === 'satellite' ? '#0f172a' : '#aad3df'}
            className="dark:fill-[#17263c]"
          />

          {/* 2. Realistic Singapore Mainland Landmass */}
          <g>
            {/* Mainland Singapore Shape */}
            <path
              d="M 85,395 C 65,360 80,310 130,270 C 180,240 240,215 315,190 C 370,165 425,100 480,75 C 530,55 590,65 650,95 C 690,120 730,160 810,185 C 880,205 935,240 955,290 C 965,320 940,350 890,365 C 830,385 750,400 680,410 C 620,420 575,445 525,445 C 475,445 435,420 375,425 C 315,430 250,460 185,455 C 130,450 95,420 85,395 Z"
              fill={mapMode === 'satellite' ? '#1c2826' : '#f3f4f6'}
              stroke="#cbd5e1"
              strokeWidth="2"
              className="dark:fill-[#242f3e] dark:stroke-[#334155]"
            />

            {/* City Urban Grid Texture over land */}
            {mapMode === 'map' && (
              <path
                d="M 85,395 C 65,360 80,310 130,270 C 180,240 240,215 315,190 C 370,165 425,100 480,75 C 530,55 590,65 650,95 C 690,120 730,160 810,185 C 880,205 935,240 955,290 C 965,320 940,350 890,365 C 830,385 750,400 680,410 C 620,420 575,445 525,445 C 475,445 435,420 375,425 C 315,430 250,460 185,455 C 130,450 95,420 85,395 Z"
                fill="url(#cityGrid)"
                opacity="0.6"
              />
            )}

            {/* Sentosa Island */}
            <path
              d="M 460,490 C 475,480 520,480 545,495 C 570,510 565,540 540,555 C 510,570 475,565 450,545 C 435,525 440,500 460,490 Z"
              fill={mapMode === 'satellite' ? '#1c2826' : '#f3f4f6'}
              stroke="#cbd5e1"
              strokeWidth="1.5"
              className="dark:fill-[#242f3e] dark:stroke-[#334155]"
            />

            {/* Jurong Island Industrial Cluster (Southwest) */}
            <path
              d="M 210,470 C 230,455 270,460 280,485 C 290,510 260,535 230,530 C 205,520 195,490 210,470 Z"
              fill={mapMode === 'satellite' ? '#1c2826' : '#e5e7eb'}
              stroke="#cbd5e1"
              strokeWidth="1.2"
              className="dark:fill-[#1e293b]"
            />

            {/* Pulau Ubin & Pulau Tekong (Northeast) */}
            <path
              d="M 750,140 C 770,130 810,135 830,150 C 820,165 780,170 755,160 Z"
              fill={mapMode === 'satellite' ? '#1c2826' : '#d5f5e3'}
              stroke="#cbd5e1"
              strokeWidth="1"
              className="dark:fill-[#223830]"
            />
            <path
              d="M 845,150 C 870,140 910,150 920,175 C 905,195 865,190 845,175 Z"
              fill={mapMode === 'satellite' ? '#1c2826' : '#f3f4f6'}
              stroke="#cbd5e1"
              strokeWidth="1"
              className="dark:fill-[#242f3e]"
            />
          </g>

          {/* 3. Google Maps Parks, Nature Reserves & Lakes */}
          <g>
            {/* Central Catchment & MacRitchie Nature Reserve (Green Forest) */}
            <path
              d="M 460,240 C 480,210 530,215 550,250 C 565,285 540,320 500,330 C 465,320 445,275 460,240 Z"
              fill="#cceada"
              stroke="#a7d7c5"
              strokeWidth="1"
              className="dark:fill-[#223830] dark:stroke-[#1b4332]"
            />
            {/* Western Catchment & Tengah Forest */}
            <path
              d="M 230,260 C 270,240 310,260 310,290 C 290,320 240,330 220,300 Z"
              fill="#cceada"
              stroke="#a7d7c5"
              strokeWidth="1"
              className="dark:fill-[#223830] dark:stroke-[#1b4332]"
            />
            {/* Water Reservoirs: MacRitchie, Seletar, Marina Bay */}
            <path
              d="M 485,260 Q 520,270 515,290 Q 480,285 485,260 Z"
              fill="#aad3df"
              className="dark:fill-[#17263c]"
            />
            <path
              d="M 560,390 Q 585,395 575,415 Q 550,405 560,390 Z"
              fill="#aad3df"
              className="dark:fill-[#17263c]"
            />
          </g>

          {/* 4. Google Maps Realistic Highway & Expressway Network */}
          <g strokeLinecap="round" strokeLinejoin="round">
            {/* Pan Island Expressway (PIE) - Yellow Artery */}
            <path
              d="M 120,410 L 220,350 L 340,320 L 450,300 L 580,310 L 720,320 L 850,300 L 890,290"
              fill="none"
              stroke="#fbd78f"
              strokeWidth="4"
              className="dark:stroke-[#b48316]"
            />
            <path
              d="M 120,410 L 220,350 L 340,320 L 450,300 L 580,310 L 720,320 L 850,300 L 890,290"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              className="dark:stroke-[#fef08a]"
            />

            {/* Ayer Rajah Expressway (AYE) */}
            <path
              d="M 150,430 L 260,400 L 380,390 L 480,410 L 560,415"
              fill="none"
              stroke="#fbd78f"
              strokeWidth="3.5"
              className="dark:stroke-[#b48316]"
            />
            <path
              d="M 150,430 L 260,400 L 380,390 L 480,410 L 560,415"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              className="dark:stroke-[#fef08a]"
            />

            {/* Central Expressway (CTE) */}
            <path
              d="M 510,130 L 515,220 L 525,320 L 545,395"
              fill="none"
              stroke="#fbd78f"
              strokeWidth="3.5"
              className="dark:stroke-[#b48316]"
            />
            <path
              d="M 510,130 L 515,220 L 525,320 L 545,395"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              className="dark:stroke-[#fef08a]"
            />

            {/* East Coast Parkway (ECP) */}
            <path
              d="M 560,415 L 680,390 L 800,360 L 890,300"
              fill="none"
              stroke="#fbd78f"
              strokeWidth="3.5"
              className="dark:stroke-[#b48316]"
            />
            <path
              d="M 560,415 L 680,390 L 800,360 L 890,300"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              className="dark:stroke-[#fef08a]"
            />

            {/* Secondary Arterials (White Street Lines) */}
            <path d="M 390,210 L 410,270 L 390,375" fill="none" stroke="#ffffff" strokeWidth="1.5" className="dark:stroke-slate-700" />
            <path d="M 610,210 L 635,270 L 640,360" fill="none" stroke="#ffffff" strokeWidth="1.5" className="dark:stroke-slate-700" />
            <path d="M 525,230 L 610,210" fill="none" stroke="#ffffff" strokeWidth="1.5" className="dark:stroke-slate-700" />
          </g>

          {/* 5. Expressway Road Shields (Google Maps Style Green Pill Shields) */}
          <g fontSize="8" fontWeight="bold" fontFamily="sans-serif">
            {/* PIE */}
            <rect x="360" y="308" width="22" height="12" rx="3" fill="#0f9d58" stroke="#ffffff" strokeWidth="0.8" />
            <text x="371" y="317" textAnchor="middle" fill="#ffffff">PIE</text>

            {/* AYE */}
            <rect x="300" y="388" width="22" height="12" rx="3" fill="#0f9d58" stroke="#ffffff" strokeWidth="0.8" />
            <text x="311" y="397" textAnchor="middle" fill="#ffffff">AYE</text>

            {/* CTE */}
            <rect x="528" y="270" width="22" height="12" rx="3" fill="#0f9d58" stroke="#ffffff" strokeWidth="0.8" />
            <text x="539" y="279" textAnchor="middle" fill="#ffffff">CTE</text>

            {/* ECP */}
            <rect x="730" y="370" width="22" height="12" rx="3" fill="#0f9d58" stroke="#ffffff" strokeWidth="0.8" />
            <text x="741" y="379" textAnchor="middle" fill="#ffffff">ECP</text>
          </g>

          {/* 6. Sector Overlay with Real-Time PSI Readouts */}
          {sectors.map((sec) => {
            const isSelected = selectedRegion === sec.id;
            const isHovered = hoveredRegion === sec.id;
            const style = getSectorFill(sec.id, isSelected, isHovered);
            const center = geoToSvg(sec.labelLat, sec.labelLng);
            const data = allRegionsData[sec.id];

            return (
              <g
                key={sec.id}
                onClick={() => onSelectRegion(sec.id)}
                onMouseEnter={() => setHoveredRegion(sec.id)}
                onMouseLeave={() => setHoveredRegion(null)}
                className="cursor-pointer transition-all duration-200"
              >
                <path
                  d={sec.path}
                  fill={style.fill}
                  fillOpacity={style.opacity}
                  stroke={style.stroke}
                  strokeWidth={style.strokeWidth}
                  strokeLinejoin="round"
                  className="transition-all duration-300"
                />

                {/* Sector Callout Tag (Google Maps Place Badge) */}
                <g transform={`translate(${center.x}, ${center.y})`}>
                  <rect
                    x="-50"
                    y="-14"
                    width="100"
                    height="28"
                    rx="8"
                    fill={isSelected ? '#1a73e8' : '#ffffff'}
                    stroke={isSelected ? '#ffffff' : '#cbd5e1'}
                    strokeWidth="1.2"
                    className="shadow-md filter drop-shadow dark:fill-slate-900 dark:stroke-slate-700"
                  />
                  <text
                    x="0"
                    y="-1"
                    textAnchor="middle"
                    fill={isSelected ? '#ffffff' : '#0f172a'}
                    fontSize="10"
                    fontWeight="700"
                    className="font-sans dark:fill-white"
                  >
                    {sec.name.replace(' Region', '')}
                  </text>
                  <text
                    x="0"
                    y="10"
                    textAnchor="middle"
                    fill={isSelected ? '#e0f2fe' : '#64748b'}
                    fontSize="9"
                    fontWeight="600"
                    className="font-mono tabular-nums dark:fill-slate-300"
                  >
                    PSI {data?.psi24Hourly ?? '--'} · {data?.status ?? 'Mod'}
                  </text>
                </g>
              </g>
            );
          })}

          {/* 7. Official Singapore Tourism Board (STB) Attractions Mapped Accurately by Coordinates */}
          {visibleAttractions.map((attraction) => {
            const pos = geoToSvg(attraction.latitude, attraction.longitude);
            const isTargeted = selectedAttraction?.id === attraction.id;

            return (
              <g
                key={attraction.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedAttraction(attraction);
                  onSelectRegion(attraction.region);
                }}
                className="cursor-pointer group"
              >
                {/* Google Maps Teardrop Location Marker Pin */}
                <g transform="translate(0, -22)" className="transition-transform group-hover:scale-125 duration-150">
                  {/* Pin Drop Shadow */}
                  <ellipse cx="0" cy="22" rx="4.5" ry="2" fill="#000000" opacity="0.3" />

                  {/* Teardrop Pin Shape */}
                  <path
                    d="M 0,0 C -6,-10 -9,-14 -9,-18 C -9,-23 -5,-27 0,-27 C 5,-27 9,-23 9,-18 C 9,-14 6,-10 0,0 Z"
                    fill={
                      attraction.isIndoor
                        ? '#059669' // Emerald for Clean HEPA Indoor Sanctuaries
                        : '#ea4335' // Google Red for Outdoor Attractions
                    }
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    filter="url(#markerShadow)"
                  />

                  {/* White Center Badge */}
                  <circle cx="0" cy="-18" r="3.5" fill="#ffffff" />
                </g>

                {/* Name Label */}
                {(isTargeted || zoomLevel > 1.2) && (
                  <g transform="translate(0, 8)" className="pointer-events-none">
                    <rect
                      x={-attraction.name.length * 3.1 - 6}
                      y="-9"
                      width={attraction.name.length * 6.2 + 12}
                      height="17"
                      rx="4"
                      fill="#ffffff"
                      stroke="#cbd5e1"
                      strokeWidth="1"
                      className="shadow-md filter drop-shadow dark:fill-slate-900 dark:stroke-slate-700"
                    />
                    <text
                      x="0"
                      y="3"
                      textAnchor="middle"
                      fill="#0f172a"
                      fontSize="9"
                      fontWeight="bold"
                      className="font-sans dark:fill-white"
                    >
                      {attraction.name}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* 8. User GPS / Keyed-In Location Pin (Google Maps Blue Pulse Dot) */}
          {userPin && (
            <g transform={`translate(${userPin.x}, ${userPin.y})`}>
              <circle r="16" fill="#4285f4" fillOpacity="0.25" className="animate-ping" />
              <circle r="10" fill="#1a73e8" stroke="#ffffff" strokeWidth="2.5" className="shadow-md" />
              <circle r="3.5" fill="#ffffff" />

              <g transform="translate(0, -28)">
                <rect
                  x="-65"
                  y="-16"
                  width="130"
                  height="22"
                  rx="6"
                  fill="#1a73e8"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                  className="shadow-lg"
                />
                <text
                  x="0"
                  y="-1"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="9.5"
                  fontWeight="bold"
                >
                  📍 {userLocationName ? userLocationName.slice(0, 18) : 'Your Location'}
                </text>
              </g>
            </g>
          )}

          {/* Google Maps Watermark & Geography Labels */}
          <text x="25" y="598" fill="#64748b" fontSize="9.5" fontWeight="600" fontFamily="sans-serif">
            Singapore Strait · Selat Singapura
          </text>
          <text x="760" y="45" fill="#64748b" fontSize="9.5" fontWeight="600" fontFamily="sans-serif">
            Johor Strait (Malaysia Border)
          </text>
        </svg>

        {/* Google Maps Authentic Bottom Left Logo & Attribution */}
        <div className="absolute bottom-2.5 left-3 z-10 flex items-center gap-1.5 pointer-events-none text-[10px]">
          <span className="font-bold tracking-tight text-slate-700 dark:text-slate-200">
            <span className="text-[#4285f4]">G</span>
            <span className="text-[#ea4335]">o</span>
            <span className="text-[#fbbc05]">o</span>
            <span className="text-[#4285f4]">g</span>
            <span className="text-[#34a853]">l</span>
            <span className="text-[#ea4335]">e</span>
          </span>
          <span className="text-slate-500 dark:text-slate-400">Map data ©2026 SLA · Singapore Tourism Board</span>
        </div>

        {/* Google Maps Authentic Scale Indicator */}
        <div className="absolute bottom-2.5 right-3 z-10 flex items-center gap-1 text-[9px] text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded shadow-xs">
          <span>5 km</span>
          <div className="w-8 h-1 bg-slate-600 dark:bg-slate-300 rounded" />
        </div>
      </div>

      {/* Google Maps Authentic InfoWindow Card for Selected Attraction with 5-7 words & Details Modal */}
      {selectedAttraction && (
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  selectedAttraction.isIndoor
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                {selectedAttraction.hazeRating}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                {selectedAttraction.region} Sector · 24h PSI {allRegionsData[selectedAttraction.region]?.psi24Hourly ?? '--'}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {selectedAttraction.name}
            </h3>

            {/* 5-7 words simplified information */}
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 inline-block">
              <span className="text-[10px] uppercase font-bold text-slate-400 mr-1.5">
                {t('summary')}
              </span>
              <span className="font-medium">
                {selectedAttraction.isIndoor
                  ? 'Sheltered indoor attraction with air filtration.'
                  : 'Outdoor landmark with open air exposure.'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveAttractionModal(selectedAttraction)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-700 text-white font-bold text-xs hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{t('details')}</span>
            </button>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                selectedAttraction.name + ' Singapore'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1a73e8] hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-sm"
            >
              <span>Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={() => setSelectedAttraction(null)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Close card"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Pop-up Modal for Selected Map Attraction Details */}
      {activeAttractionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setActiveAttractionModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      activeAttractionModal.isIndoor
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}
                  >
                    {activeAttractionModal.hazeRating}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                    {activeAttractionModal.region} Sector · 24h PSI {allRegionsData[activeAttractionModal.region]?.psi24Hourly ?? '--'}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {activeAttractionModal.name}
                </h3>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                <span className="font-bold text-slate-900 dark:text-white block mb-1">Overview:</span>
                {activeAttractionModal.overview}
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <span>{activeAttractionModal.address}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    activeAttractionModal.name + ' Singapore'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a73e8] hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-sm"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Open in Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                </a>
                <button
                  onClick={() => setActiveAttractionModal(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 transition-colors"
                >
                  <span>{t('close')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
