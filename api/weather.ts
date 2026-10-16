/**
 * Serverless Weather 2-Hour Forecast Endpoint
 * Route: GET /api/weather
 * Upstream: GET https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast
 */

export interface AreaForecast {
  area: string;
  forecast: string;
  latitude?: number;
  longitude?: number;
}

export interface WeatherApiResponse {
  code: number;
  data: {
    area_metadata: Array<{
      name: string;
      label_location: {
        latitude: number;
        longitude: number;
      };
    }>;
    items: Array<{
      update_timestamp: string;
      timestamp: string;
      valid_period: {
        start: string;
        end: string;
        text?: string;
      };
      forecasts: Array<{
        area: string;
        forecast: string;
      }>;
    }>;
  };
  errorMsg?: string;
}

export default async function handler(req: any, res?: any) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    if (res && typeof res.status === 'function') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key');
      return res.status(204).end();
    }
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key',
      },
    });
  }

  // Guardrail: If a key variable is configured but empty, return 503 "key not configured" and do not call provider
  if (
    (process.env.DATA_GOV_SG_API_KEY !== undefined && process.env.DATA_GOV_SG_API_KEY.trim() === '') ||
    (process.env.API_KEY !== undefined && process.env.API_KEY.trim() === '')
  ) {
    const notConfiguredPayload = {
      error: 'key not configured',
      message: 'API key is configured as an empty string. Please set a valid key in environment.',
    };
    if (res && typeof res.status === 'function') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(503).json(notConfiguredPayload);
    }
    return new Response(JSON.stringify(notConfiguredPayload), {
      status: 503,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }

  try {
    const upstreamUrl = 'https://api-open.data.gov.sg/v2/real-time/api/two-hr-forecast';

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'User-Agent': 'NonHazeActivities/1.0',
    };

    const apiKey = process.env.DATA_GOV_SG_API_KEY || process.env.DATA_GOV_API_KEY;
    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }

    const upstreamResponse = await fetch(upstreamUrl, {
      method: 'GET',
      headers,
    });

    const data = await upstreamResponse.json().catch(() => null);

    if (!upstreamResponse.ok) {
      const errorPayload = {
        error: 'Upstream data.gov.sg Weather API returned an error',
        statusCode: upstreamResponse.status,
        details: data,
      };

      if (res && typeof res.status === 'function') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(upstreamResponse.status).json(errorPayload);
      }

      return new Response(JSON.stringify(errorPayload), {
        status: upstreamResponse.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Success response
    if (res && typeof res.status === 'function') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
      return res.status(200).json(data);
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error: any) {
    const errorPayload = {
      error: 'Failed to fetch weather forecast from data.gov.sg',
      message: error?.message || 'Internal connection error',
    };

    if (res && typeof res.status === 'function') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(502).json(errorPayload);
    }

    return new Response(JSON.stringify(errorPayload), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
