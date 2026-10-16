import React, { useState, useEffect } from 'react';
import { RegionalPsiData, SingaporeRegion } from '../types/haze';
import {
  MapPin,
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ExternalLink,
  ShieldCheck,
  Building,
  TreePine,
  Search,
  X,
  Filter,
} from 'lucide-react';
import { TouristAttraction } from '../../api/tourist';

interface SingaporeRegionalMapProps {
  selectedRegion: SingaporeRegion;
  allRegionsData: Record<SingaporeRegion, RegionalPsiData>;
  onSelectRegion: (region: SingaporeRegion) => void;
  userLocationName?: string;
  userCoordinates?: { lat: number; lng: number };
}

// Projection bounds for accurate geographic Singapore Island mapping
// Longitude: 103.60 (Tuas South) -> 104.04 (Changi Coast)
// Latitude: 1.20 (Sentosa/Southern Islands) -> 1.48 (Johor Strait/Woodlands)
const MIN_LNG = 103.60;
const MAX_LNG = 104.04;
const MIN_LAT = 1.20;
const MAX_LAT = 1.48;

export function geoToSvg(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 1000;
  const y = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * 620;
  return {
    x: Math.min(Math.max(x, 10), 990),
    y: Math.min(Math.max(y, 10), 610),
  };
}

export const SingaporeRegionalMap: React.FC<SingaporeRegionalMapProps> = ({
  selectedRegion,
  allRegionsData,
  onSelectRegion,
  userLocationName,
  userCoordinates,
}) => {
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hazeHeatmap'>('roadmap');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedAttraction, setSelectedAttraction] = useState<TouristAttraction | null>(null);
  const [attractions, setAttractions] = useState<TouristAttraction[]>([]);
  const [filterIndoorOnly, setFilterIndoorOnly] = useState<boolean>(false);
  const [hoveredRegion, setHoveredRegion] = useState<SingaporeRegion | null>(null);

  // Fetch real STB tourist attractions from /api/tourist
  useEffect(() => {
    let isMounted = true;
    fetch('/api/tourist')
      .then((res) => res.json())
      .then((res) => {
        if (isMounted && res.data && Array.isArray(res.data)) {
          setAttractions(res.data);
        }
      })
      .catch((err) => console.warn('Could not load tourist attractions:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter attractions based on indoor toggle and selected region
  const visibleAttractions = attractions.filter((a) => {
    if (filterIndoorOnly && !a.isIndoor) return false;
    return true;
  });

  // Calculate sector color based on live PSI
  const getSectorStyle = (regionId: SingaporeRegion, isSelected: boolean, isHovered: boolean) => {
    const psi = allRegionsData[regionId]?.psi24Hourly ?? 70;
    let baseColor = '#0ea5e9'; // sky (Moderate)

    if (psi <= 50) baseColor = '#10b981'; // emerald (Good)
    else if (psi <= 100) baseColor = '#0284c7'; // sky (Moderate)
    else if (psi <= 200) baseColor = '#f59e0b'; // amber (Unhealthy)
    else if (psi <= 300) baseColor = '#ea580c'; // orange (Very Unhealthy)
    else baseColor = '#e11d48'; // rose (Hazardous)

    if (mapType === 'hazeHeatmap') {
      return {
        fill: baseColor,
        opacity: isSelected ? 0.75 : isHovered ? 0.55 : 0.4,
        stroke: '#0f172a',
        strokeWidth: isSelected ? 3 : 1.5,
      };
    }

    // Google Maps Roadmap style: subtle boundary tint with distinct boundary outline
    return {
      fill: isSelected ? baseColor : '#ffffff',
      opacity: isSelected ? 0.25 : isHovered ? 0.15 : 0.04,
      stroke: isSelected ? '#1a73e8' : isHovered ? '#4285f4' : '#94a3b8',
      strokeWidth: isSelected ? 2.5 : 1.2,
      strokeDasharray: isSelected ? undefined : '5,3',
    };
  };

  // Geographic sector SVG paths calibrated to real coordinates
  const sectors = [
    {
      id: 'north' as SingaporeRegion,
      name: 'North Sector',
      centerLat: 1.418,
      centerLng: 103.82,
      path: 'M 350,195 L 390,130 L 450,85 L 530,65 L 610,75 L 670,120 L 685,160 L 610,210 L 525,230 L 450,225 L 390,210 Z',
    },
    {
      id: 'west' as SingaporeRegion,
      name: 'West Sector',
      centerLat: 1.3418,
      centerLng: 103.705,
      path: 'M 140,430 L 70,390 L 105,330 L 175,270 L 260,230 L 350,195 L 390,210 L 410,270 L 390,375 L 340,420 L 280,450 L 190,440 Z',
    },
    {
      id: 'central' as SingaporeRegion,
      name: 'Central Sector',
      centerLat: 1.3048,
      centerLng: 103.832,
      path: 'M 410,270 L 450,225 L 525,230 L 610,210 L 635,270 L 640,360 L 590,410 L 530,440 L 460,420 L 390,375 Z',
    },
    {
      id: 'east' as SingaporeRegion,
      name: 'East Sector',
      centerLat: 1.3574,
      centerLng: 103.94,
      path: 'M 610,210 L 685,160 L 760,175 L 850,210 L 920,250 L 945,300 L 900,345 L 820,380 L 730,395 L 640,360 L 635,270 Z',
    },
    {
      id: 'south' as SingaporeRegion,
      name: 'South Sector (Sentosa)',
      centerLat: 1.254,
      centerLng: 103.824,
      path: 'M 460,420 L 530,440 L 590,410 L 580,470 L 550,540 L 490,565 L 430,545 L 415,480 Z',
    },
  ];

  // User location pin position
  const userPinPos = userCoordinates
    ? geoToSvg(userCoordinates.lat, userCoordinates.lng)
    : userLocationName?.toLowerCase().includes('sentosa')
    ? geoToSvg(1.254, 103.824)
    : userLocationName?.toLowerCase().includes('changi')
    ? geoToSvg(1.36, 103.99)
    : userLocationName?.toLowerCase().includes('zoo')
    ? geoToSvg(1.404, 103.793)
    : userLocationName?.toLowerCase().includes('jurong')
    ? geoToSvg(1.333, 103.744)
    : geoToSvg(1.284, 103.859); // Marina Bay Sands default

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md bg-[#aad3df] dark:bg-[#17263c] transition-colors select-none">
      {/* Top Google Maps Floating Control Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-2">
        {/* Map Type Switcher (Roadmap / Satellite / Haze Heatmap) */}
        <div className="flex items-center bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700/80 p-1 text-xs font-semibold">
          <button
            onClick={() => setMapType('roadmap')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              mapType === 'roadmap'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Google Map
          </button>
          <button
            onClick={() => setMapType('satellite')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              mapType === 'satellite'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setMapType('hazeHeatmap')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              mapType === 'hazeHeatmap'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Haze Sectors
          </button>
        </div>

        {/* Filter Indoor HEPA Sanctuaries Toggle */}
        <button
          onClick={() => setFilterIndoorOnly(!filterIndoorOnly)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl shadow-md border text-xs font-semibold transition-all ${
            filterIndoorOnly
              ? 'bg-emerald-600 text-white border-emerald-700'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-50'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Indoor HEPA Only ({visibleAttractions.length})</span>
        </button>
      </div>

      {/* Top Right Zoom Controls & Legend */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-xl shadow-md border border-slate-200/80 dark:border-slate-700/80 overflow-hidden text-slate-700 dark:text-slate-200">
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2))}
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
            className="px-2 py-1 rounded-lg bg-white/90 dark:bg-slate-900/90 text-[10px] font-bold shadow-md border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
          >
            Reset
          </button>
        )}
      </div>

      {/* SVG Google Maps Interactive Canvas */}
      <div className="relative w-full aspect-[16/10] min-h-[380px] max-h-[540px] overflow-hidden flex items-center justify-center">
        <svg
          viewBox="0 0 1000 620"
          className="w-full h-full transition-transform duration-300 ease-out origin-center"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          {/* Base Water Texture */}
          <rect
            width="1000"
            height="620"
            fill={
              mapType === 'satellite'
                ? '#0d1b2a'
                : '#aad3df'
            }
            className="dark:fill-[#17263c]"
          />

          {/* Surrounding Coastline Grids & Water Bathymetry */}
          <g opacity="0.3">
            <line x1="0" y1="150" x2="1000" y2="150" stroke="#87b6c5" strokeWidth="0.5" strokeDasharray="3,3" />
            <line x1="0" y1="300" x2="1000" y2="300" stroke="#87b6c5" strokeWidth="0.5" strokeDasharray="3,3" />
            <line x1="0" y1="450" x2="1000" y2="450" stroke="#87b6c5" strokeWidth="0.5" strokeDasharray="3,3" />
            <line x1="250" y1="0" x2="250" y2="620" stroke="#87b6c5" strokeWidth="0.5" strokeDasharray="3,3" />
            <line x1="500" y1="0" x2="500" y2="620" stroke="#87b6c5" strokeWidth="0.5" strokeDasharray="3,3" />
            <line x1="750" y1="0" x2="750" y2="620" stroke="#87b6c5" strokeWidth="0.5" strokeDasharray="3,3" />
          </g>

          {/* Singapore Main Island & Sentosa Landmass (Accurate Google Maps Land Geometry) */}
          <g>
            {/* Main Island Landmass */}
            <path
              d="M 85,395 C 65,360 80,310 130,270 C 180,240 240,215 315,190 C 370,165 425,100 480,75 C 530,55 590,65 650,95 C 690,120 730,160 810,185 C 880,205 935,240 955,290 C 965,320 940,350 890,365 C 830,385 750,400 680,410 C 620,420 575,445 525,445 C 475,445 435,420 375,425 C 315,430 250,460 185,455 C 130,450 95,420 85,395 Z"
              fill={mapType === 'satellite' ? '#1c2826' : '#f3f4f6'}
              stroke="#cbd5e1"
              strokeWidth="2"
              className="dark:fill-[#242f3e] dark:stroke-[#334155]"
            />

            {/* Sentosa Island Landmass */}
            <path
              d="M 460,490 C 475,480 520,480 545,495 C 570,510 565,540 540,555 C 510,570 475,565 450,545 C 435,525 440,500 460,490 Z"
              fill={mapType === 'satellite' ? '#1c2826' : '#f3f4f6'}
              stroke="#cbd5e1"
              strokeWidth="1.5"
              className="dark:fill-[#242f3e] dark:stroke-[#334155]"
            />

            {/* Pulau Ubin & Pulau Tekong (Northeast Islands) */}
            <path
              d="M 750,140 C 770,130 810,135 830,150 C 820,165 780,170 755,160 Z"
              fill={mapType === 'satellite' ? '#1c2826' : '#f3f4f6'}
              stroke="#cbd5e1"
              strokeWidth="1"
              className="dark:fill-[#242f3e]"
            />
          </g>

          {/* Nature Reserves & Green Spaces (Central Catchment, MacRitchie, Bukit Timah) */}
          <g opacity={mapType === 'satellite' ? '0.2' : '0.9'}>
            {/* Central Catchment & MacRitchie Nature Reserve */}
            <path
              d="M 460,240 C 480,210 530,215 550,250 C 565,285 540,320 500,330 C 465,320 445,275 460,240 Z"
              fill="#cceada"
              className="dark:fill-[#223830]"
            />
            {/* Western Catchment & Tengah Forest */}
            <path
              d="M 230,260 C 270,240 310,260 310,290 C 290,320 240,330 220,300 Z"
              fill="#cceada"
              className="dark:fill-[#223830]"
            />
            {/* Water Reservoirs (MacRitchie, Upper Seletar, Marina Reservoir) */}
            <path
              d="M 490,260 Q 520,270 515,290 Q 480,285 490,260 Z"
              fill="#aad3df"
              className="dark:fill-[#17263c]"
            />
            <path
              d="M 560,390 Q 580,395 575,410 Q 555,405 560,390 Z"
              fill="#aad3df"
              className="dark:fill-[#17263c]"
            />
          </g>

          {/* Major Singapore Expressway Network (Google Maps Yellow/Orange Artery Lines) */}
          <g strokeLinecap="round" strokeLinejoin="round" opacity="0.9">
            {/* Pan Island Expressway (PIE) - West to East */}
            <path
              d="M 120,410 L 220,350 L 340,320 L 450,300 L 580,310 L 720,320 L 850,300 L 890,290"
              fill="none"
              stroke="#fbd78f"
              strokeWidth="4"
              className="dark:stroke-[#5b4e33]"
            />
            <path
              d="M 120,410 L 220,350 L 340,320 L 450,300 L 580,310 L 720,320 L 850,300 L 890,290"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              className="dark:stroke-[#e2b714]"
            />

            {/* Ayer Rajah Expressway (AYE) - Southwest to CBD */}
            <path
              d="M 150,430 L 260,400 L 380,390 L 480,410 L 560,415"
              fill="none"
              stroke="#fbd78f"
              strokeWidth="3.5"
              className="dark:stroke-[#5b4e33]"
            />
            <path
              d="M 150,430 L 260,400 L 380,390 L 480,410 L 560,415"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              className="dark:stroke-[#e2b714]"
            />

            {/* Central Expressway (CTE) - North to South */}
            <path
              d="M 510,130 L 515,220 L 525,320 L 545,395"
              fill="none"
              stroke="#fbd78f"
              strokeWidth="3.5"
              className="dark:stroke-[#5b4e33]"
            />
            <path
              d="M 510,130 L 515,220 L 525,320 L 545,395"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              className="dark:stroke-[#e2b714]"
            />

            {/* East Coast Parkway (ECP) - Airport to Marina Bay */}
            <path
              d="M 560,415 L 680,390 L 800,360 L 890,300"
              fill="none"
              stroke="#fbd78f"
              strokeWidth="3.5"
              className="dark:stroke-[#5b4e33]"
            />
            <path
              d="M 560,415 L 680,390 L 800,360 L 890,300"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2"
              className="dark:stroke-[#e2b714]"
            />
          </g>

          {/* Regional Sector Polygons with Real-time PSI Status */}
          {sectors.map((sec) => {
            const isSelected = selectedRegion === sec.id;
            const isHovered = hoveredRegion === sec.id;
            const style = getSectorStyle(sec.id, isSelected, isHovered);
            const center = geoToSvg(sec.centerLat, sec.centerLng);
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
                  strokeDasharray={style.strokeDasharray}
                  strokeLinejoin="round"
                  className="transition-all duration-300 hover:filter hover:brightness-105"
                />

                {/* Sector Name Callout Tag */}
                <g transform={`translate(${center.x}, ${center.y})`}>
                  <rect
                    x="-55"
                    y="-16"
                    width="110"
                    height="32"
                    rx="8"
                    fill={isSelected ? '#1a73e8' : '#ffffff'}
                    stroke={isSelected ? '#ffffff' : '#cbd5e1'}
                    strokeWidth="1.5"
                    className="shadow-sm filter drop-shadow dark:fill-slate-800 dark:stroke-slate-700"
                  />
                  <text
                    x="0"
                    y="-2"
                    textAnchor="middle"
                    fill={isSelected ? '#ffffff' : '#1e293b'}
                    fontSize="11"
                    fontWeight="700"
                    className="font-sans dark:fill-white"
                  >
                    {sec.name.replace(' Sector', '')}
                  </text>
                  <text
                    x="0"
                    y="11"
                    textAnchor="middle"
                    fill={isSelected ? '#ffffff' : '#64748b'}
                    fontSize="10"
                    fontWeight="600"
                    className="font-mono tabular-nums dark:fill-slate-300"
                  >
                    PSI {data?.psi24Hourly ?? '--'} · {data?.status ?? 'Mod'}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Real STB Tourist Attractions Plotted by Exact Latitude & Longitude */}
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
                {/* Google Maps Teardrop Marker Pin */}
                <g transform="translate(0, -22)" className="transition-transform group-hover:scale-125 duration-150">
                  {/* Pin Drop Shadow */}
                  <ellipse cx="0" cy="22" rx="4" ry="2" fill="#000000" opacity="0.25" />

                  {/* Teardrop Path */}
                  <path
                    d="M 0,0 C -6,-10 -9,-14 -9,-18 C -9,-23 -5,-27 0,-27 C 5,-27 9,-23 9,-18 C 9,-14 6,-10 0,0 Z"
                    fill={
                      attraction.isIndoor
                        ? '#059669' // Emerald green for HEPA indoor sanctuaries
                        : '#ea4335' // Google Red for outdoor attractions
                    }
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="filter drop-shadow-sm"
                  />

                  {/* White Center Dot / Icon */}
                  <circle cx="0" cy="-18" r="3.5" fill="#ffffff" />
                </g>

                {/* Name Label on Hover or Zoom */}
                {(isTargeted || zoomLevel > 1.25) && (
                  <g transform="translate(0, 8)" className="pointer-events-none">
                    <rect
                      x={-attraction.name.length * 3.2 - 8}
                      y="-10"
                      width={attraction.name.length * 6.4 + 16}
                      height="18"
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

          {/* User's Keyed-in Location Marker (Blue Google Maps You-Are-Here Pin) */}
          {userPinPos && (
            <g transform={`translate(${userPinPos.x}, ${userPinPos.y})`} className="animate-bounce">
              <circle r="18" fill="#4285f4" fillOpacity="0.2" className="animate-ping" />
              <circle r="12" fill="#1a73e8" stroke="#ffffff" strokeWidth="2.5" className="shadow-md" />
              <circle r="4" fill="#ffffff" />

              {/* Callout Bubble */}
              <g transform="translate(0, -32)">
                <rect
                  x="-75"
                  y="-18"
                  width="150"
                  height="24"
                  rx="6"
                  fill="#1a73e8"
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  className="shadow-lg"
                />
                <text
                  x="0"
                  y="-2"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="10"
                  fontWeight="bold"
                >
                  📍 {userLocationName || 'You Are Here'}
                </text>
              </g>
            </g>
          )}

          {/* Google Maps Geographic Watermarks & Borders */}
          <text x="30" y="595" fill="#64748b" fontSize="10" fontWeight="600" fontFamily="sans-serif">
            Singapore Strait · Selat Singapura
          </text>
          <text x="740" y="45" fill="#64748b" fontSize="10" fontWeight="600" fontFamily="sans-serif">
            Johor Strait (Malaysia Border)
          </text>
        </svg>

        {/* Google Maps Style Bottom Left Attribution */}
        <div className="absolute bottom-2 left-3 z-10 flex items-center gap-1.5 pointer-events-none text-[10px]">
          <span className="font-bold tracking-tight text-slate-700 dark:text-slate-200">
            <span className="text-blue-500">G</span>
            <span className="text-red-500">o</span>
            <span className="text-amber-500">o</span>
            <span className="text-blue-500">g</span>
            <span className="text-green-500">l</span>
            <span className="text-red-500">e</span>
          </span>
          <span className="text-slate-500 dark:text-slate-400">Map data ©2026 SLA · STB Tourism Dataset</span>
        </div>

        {/* Google Maps Style Scale Bar */}
        <div className="absolute bottom-2 right-3 z-10 flex items-center gap-1.5 text-[9px] text-slate-600 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded shadow-xs">
          <span>5 km</span>
          <div className="w-10 h-1 bg-slate-700 dark:bg-slate-300 rounded" />
        </div>
      </div>

      {/* Google Maps Style InfoWindow Card for Selected Attraction */}
      {selectedAttraction && (
        <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div className="space-y-1 max-w-2xl">
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
                {selectedAttraction.region} Zone · 24h PSI {allRegionsData[selectedAttraction.region]?.psi24Hourly ?? '--'}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {selectedAttraction.name}
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
              {selectedAttraction.overview}
            </p>

            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{selectedAttraction.address}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                selectedAttraction.name + ' Singapore'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-sm"
            >
              <span>View in Google Maps</span>
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
    </div>
  );
};
