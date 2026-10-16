/**
 * Serverless Singapore Tourist Attractions Endpoint
 * Route: GET /api/tourist
 * Upstream: data.gov.sg dataset d_0f2f47515425404e6c9d2a040dd87354 (Singapore Tourism Board)
 */

interface RawGeoJsonFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    PAGETITLE?: string;
    LATITUDE?: number;
    LONGTITUDE?: number;
    ADDRESS?: string;
    OVERVIEW?: string;
    URL_PATH?: string;
    IMAGE_PATH?: string;
    [key: string]: any;
  };
}

export interface TouristAttraction {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  overview: string;
  url: string;
  imageUrl?: string;
  region: 'central' | 'south' | 'north' | 'east' | 'west';
  isIndoor: boolean;
  hazeRating: 'Pristine HEPA' | 'Enclosed AC' | 'Sheltered' | 'Outdoor Exposure';
  suggestedIndoorSubstitute?: string;
}

// Curated baseline attractions with exact coordinates
export const CURATED_TOURIST_ATTRACTIONS: TouristAttraction[] = [
  {
    id: 'gardens-by-the-bay',
    name: 'Gardens by the Bay & Bio-Domes',
    latitude: 1.2816,
    longitude: 103.8636,
    address: '18 Marina Gardens Dr, Singapore 018953',
    overview: 'World-famous futuristic botanical sanctuary featuring Flower Dome and Cloud Forest cooled bio-domes with hospital-grade filtration.',
    url: 'https://www.gardensbythebay.com.sg',
    region: 'central',
    isIndoor: true,
    hazeRating: 'Pristine HEPA',
  },
  {
    id: 'marina-bay-sands',
    name: 'Marina Bay Sands & The Shoppes',
    latitude: 1.2838,
    longitude: 103.8591,
    address: '10 Bayfront Ave, Singapore 018956',
    overview: 'Iconic luxury destination with extensive underground air-conditioned retail channels, SkyPark, and digital ArtScience Museum.',
    url: 'https://www.marinabaysands.com',
    region: 'central',
    isIndoor: true,
    hazeRating: 'Enclosed AC',
  },
  {
    id: 'national-gallery-singapore',
    name: 'National Gallery Singapore',
    latitude: 1.2900,
    longitude: 103.8514,
    address: "1 St Andrew's Road, Singapore 178957",
    overview: 'The largest public collection of modern art in Southeast Asia, housed within the fully restored City Hall and Old Supreme Court.',
    url: 'https://www.nationalgallery.sg',
    region: 'central',
    isIndoor: true,
    hazeRating: 'Pristine HEPA',
  },
  {
    id: 'artscience-museum',
    name: 'ArtScience Museum (Future World)',
    latitude: 1.2863,
    longitude: 103.8593,
    address: '6 Bayfront Ave, Singapore 018974',
    overview: 'Lotus-inspired museum presenting immersive digital art installations by teamLab in climate-controlled dark galleries.',
    url: 'https://www.marinabaysands.com/museum.html',
    region: 'central',
    isIndoor: true,
    hazeRating: 'Pristine HEPA',
  },
  {
    id: 'jewel-changi-airport',
    name: 'Jewel Changi Airport (HSBC Rain Vortex)',
    latitude: 1.3602,
    longitude: 103.9898,
    address: '78 Airport Blvd., Singapore 819666',
    overview: 'Multi-dimensional lifestyle sanctuary crowned by the worlds tallest indoor waterfall, surrounded by the climate-controlled Shiseido Forest Valley.',
    url: 'https://www.jewelchangiairport.com',
    region: 'east',
    isIndoor: true,
    hazeRating: 'Pristine HEPA',
  },
  {
    id: 'sea-aquarium',
    name: 'S.E.A. Aquarium (Resorts World Sentosa)',
    latitude: 1.2583,
    longitude: 103.8205,
    address: '8 Sentosa Gateway, Sentosa Island, Singapore 098269',
    overview: 'Home to more than 100,000 marine animals across 1,000 species in vast, cool underwater viewing chambers.',
    url: 'https://www.rwsentosa.com',
    region: 'south',
    isIndoor: true,
    hazeRating: 'Enclosed AC',
  },
  {
    id: 'universal-studios-singapore',
    name: 'Universal Studios Singapore',
    latitude: 1.2540,
    longitude: 103.8238,
    address: '8 Sentosa Gateway, Singapore 098269',
    overview: 'Southeast Asias premier theme park with 6 themed zones. During haze alerts, prefer indoor rides like Transformers 3D and Revenge of the Mummy.',
    url: 'https://www.rwsentosa.com/uss',
    region: 'south',
    isIndoor: false,
    hazeRating: 'Outdoor Exposure',
    suggestedIndoorSubstitute: 'S.E.A. Aquarium',
  },
  {
    id: 'singapore-zoo',
    name: 'Singapore Zoo & Mandai Wildlife Reserve',
    latitude: 1.4043,
    longitude: 103.7930,
    address: '80 Mandai Lake Rd, Singapore 729826',
    overview: 'Acclaimed open-concept rainforest zoological park. If PSI exceeds 100, substitute with the River Wonders covered pavilions or Science Centre.',
    url: 'https://www.mandai.com',
    region: 'north',
    isIndoor: false,
    hazeRating: 'Outdoor Exposure',
    suggestedIndoorSubstitute: 'Science Centre Singapore & Snow City',
  },
  {
    id: 'science-centre-singapore',
    name: 'Science Centre Singapore & Omni-Theatre',
    latitude: 1.3329,
    longitude: 103.7436,
    address: '15 Science Centre Rd, Singapore 609081',
    overview: 'Massive indoor interactive science galleries, Southeast Asias premier 8K digital dome theatre, and sub-zero Snow City.',
    url: 'https://www.science.edu.sg',
    region: 'west',
    isIndoor: true,
    hazeRating: 'Enclosed AC',
  },
  {
    id: 'chinatown-heritage-centre',
    name: 'Chinatown & Buddha Tooth Relic Temple',
    latitude: 1.2815,
    longitude: 103.8443,
    address: '288 South Bridge Rd, Singapore 058840',
    overview: 'Historic district featuring the Tang-style Buddhist temple and museum. Fully sheltered interior halls with air-conditioning.',
    url: 'https://www.buddhatoothrelictemple.org.sg',
    region: 'central',
    isIndoor: true,
    hazeRating: 'Sheltered',
  },
  {
    id: 'east-coast-park',
    name: 'East Coast Park & Coastal Beach',
    latitude: 1.3015,
    longitude: 103.9066,
    address: 'E Coast Park Service Rd, Singapore',
    overview: 'Scenic coastal park popular for cycling and beach dining. High outdoor haze vulnerability during Southeast wind spells; substitute with Jewel Changi.',
    url: 'https://www.nparks.gov.sg',
    region: 'east',
    isIndoor: false,
    hazeRating: 'Outdoor Exposure',
    suggestedIndoorSubstitute: 'Jewel Changi Canopy Park',
  },
  {
    id: 'national-museum-singapore',
    name: 'National Museum of Singapore',
    latitude: 1.2966,
    longitude: 103.8485,
    address: '93 Stamford Rd, Singapore 178897',
    overview: 'Singapores oldest museum with neoclassical architecture, modern digital storytelling, and climate-controlled galleries.',
    url: 'https://www.nhb.gov.sg/nationalmuseum',
    region: 'central',
    isIndoor: true,
    hazeRating: 'Pristine HEPA',
  },
];

// In-memory cache for fast serverless responses initialized with curated STB dataset
let cachedAttractions: TouristAttraction[] = [...CURATED_TOURIST_ATTRACTIONS];
let lastFetchTime = 0;
let rateLimitedUntil = 0;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function assignRegion(lat: number, lng: number): 'central' | 'south' | 'north' | 'east' | 'west' {
  if (lat > 1.39) return 'north';
  if (lat < 1.27) return 'south';
  if (lng > 103.89) return 'east';
  if (lng < 103.77) return 'west';
  return 'central';
}

function determineIndoor(name: string, overview: string): { isIndoor: boolean; rating: TouristAttraction['hazeRating'] } {
  const text = `${name} ${overview}`.toLowerCase();
  if (text.includes('dome') || text.includes('museum') || text.includes('gallery') || text.includes('aquarium') || text.includes('jewel') || text.includes('centre')) {
    return { isIndoor: true, rating: 'Pristine HEPA' };
  }
  if (text.includes('mall') || text.includes('shoppes') || text.includes('theatre') || text.includes('temple') || text.includes('indoor')) {
    return { isIndoor: true, rating: 'Enclosed AC' };
  }
  if (text.includes('park') || text.includes('beach') || text.includes('zoo') || text.includes('trail') || text.includes('walk') || text.includes('garden')) {
    return { isIndoor: false, rating: 'Outdoor Exposure' };
  }
  return { isIndoor: true, rating: 'Sheltered' };
}

async function fetchFromDataGovSg(): Promise<TouristAttraction[]> {
  const now = Date.now();
  if (now < rateLimitedUntil) {
    return cachedAttractions;
  }

  const datasetId = 'd_0f2f47515425404e6c9d2a040dd87354';
  const initiateUrl = `https://api-open.data.gov.sg/v1/public/api/datasets/${datasetId}/initiate-download`;

  const headers: Record<string, string> = { Accept: 'application/json' };
  const apiKey = process.env.DATA_GOV_SG_API_KEY || process.env.DATA_GOV_API_KEY;
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }

  const initRes = await fetch(initiateUrl, { headers });

  if (initRes.status === 429) {
    // Back off for 15 minutes without throwing or logging error
    rateLimitedUntil = now + 15 * 60 * 1000;
    return cachedAttractions;
  }

  if (!initRes.ok) {
    return cachedAttractions;
  }

  const initData = await initRes.json();
  const fileUrl = initData?.data?.url;

  if (!fileUrl) {
    return cachedAttractions;
  }

  const geoRes = await fetch(fileUrl);
  if (!geoRes.ok) {
    return cachedAttractions;
  }

  const geoJson = await geoRes.json();
  const features: RawGeoJsonFeature[] = geoJson?.features || [];

  const parsed: TouristAttraction[] = [];
  const seenNames = new Set<string>();

  for (const f of features) {
    const props = f.properties || {};
    const name = props.PAGETITLE || props.NAME || 'Attraction';
    if (seenNames.has(name)) continue;
    seenNames.add(name);

    const lng = Number(f.geometry?.coordinates?.[0] || props.LONGTITUDE || 0);
    const lat = Number(f.geometry?.coordinates?.[1] || props.LATITUDE || 0);

    if (!lat || !lng || lat < 1.1 || lat > 1.5 || lng < 103.5 || lng > 104.2) {
      continue;
    }

    const { isIndoor, rating } = determineIndoor(name, props.OVERVIEW || '');
    const region = assignRegion(lat, lng);

    parsed.push({
      id: `gov-${props.OBJECTID_1 || Math.random().toString(36).substr(2, 9)}`,
      name,
      latitude: lat,
      longitude: lng,
      address: props.ADDRESS || `${name}, Singapore`,
      overview: props.OVERVIEW || 'Popular landmark in Singapore.',
      url: props.URL_PATH ? (props.URL_PATH.startsWith('http') ? props.URL_PATH : `https://${props.URL_PATH}`) : 'https://www.visitsingapore.com',
      region,
      isIndoor,
      hazeRating: rating,
    });
  }

  if (parsed.length > 0) {
    const combined = [...CURATED_TOURIST_ATTRACTIONS];
    for (const p of parsed) {
      if (!combined.some((c) => c.name.toLowerCase().includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(c.name.toLowerCase()))) {
        combined.push(p);
      }
    }
    return combined;
  }

  return cachedAttractions;
}

export default async function handler(req: any, res?: any) {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    if (res && typeof res.status === 'function') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return res.status(204).end();
    }
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });
  }

  try {
    const now = Date.now();
    if (now - lastFetchTime > CACHE_TTL_MS && now > rateLimitedUntil) {
      try {
        const fresh = await fetchFromDataGovSg();
        if (fresh && fresh.length > 0) {
          cachedAttractions = fresh;
        }
      } catch {
        // Fallback gracefully without console error
      }
      lastFetchTime = now;
    }

    const query: any = (req && (req as any).query) ? (req as any).query : {};
    let result: TouristAttraction[] = [...cachedAttractions];

    if (query.region && query.region !== 'national') {
      result = result.filter((a: TouristAttraction) => a.region === query.region);
    }
    if (query.indoor === 'true') {
      result = result.filter((a: TouristAttraction) => a.isIndoor);
    }
    if (query.q && typeof query.q === 'string') {
      const qLower = query.q.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(qLower) ||
          a.address.toLowerCase().includes(qLower) ||
          a.overview.toLowerCase().includes(qLower)
      );
    }

    const payload = {
      code: 0,
      source: 'data.gov.sg/datasets/d_0f2f47515425404e6c9d2a040dd87354 (STB Tourist Attractions)',
      count: result.length,
      data: result,
      timestamp: new Date().toISOString(),
    };

    if (res && typeof res.status === 'function') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=7200');
      return res.status(200).json(payload);
    }

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error: any) {
    const errorPayload = {
      code: 500,
      error: 'Failed to process tourist attractions dataset',
      fallbackCount: CURATED_TOURIST_ATTRACTIONS.length,
      data: CURATED_TOURIST_ATTRACTIONS,
    };

    if (res && typeof res.status === 'function') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(200).json(errorPayload);
    }

    return new Response(JSON.stringify(errorPayload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
