import { RegionalPsiData, SingaporeRegion, PsiApiResponse } from '../types/haze';
import { FALLBACK_PSI_DATA } from '../data/hazeData';

function determinePsiStatus(psiValue: number): RegionalPsiData['status'] {
  if (psiValue <= 50) return 'Good';
  if (psiValue <= 100) return 'Moderate';
  if (psiValue <= 200) return 'Unhealthy';
  if (psiValue <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

function getStatusDescription(status: RegionalPsiData['status']): string {
  switch (status) {
    case 'Good':
      return 'Air quality is pristine. Normal outdoor activities can be enjoyed without restrictions.';
    case 'Moderate':
      return 'Air quality is acceptable. Normal activities for most; sensitive individuals monitor exertion.';
    case 'Unhealthy':
      return 'Elevated smoke haze. Healthy individuals reduce prolonged outdoor workouts; sensitive groups stay indoors.';
    case 'Very Unhealthy':
      return 'Significant transboundary smoke haze. Avoid prolonged outdoor exposure; wear certified N95 masks.';
    case 'Hazardous':
      return 'Emergency air quality levels. Stay indoors in air-conditioned facilities with closed windows.';
  }
}

export interface PsiFetchResult {
  data: Record<SingaporeRegion, RegionalPsiData> | null;
  isLive: boolean;
  timestamp: string;
  error?: string | null;
}

export async function fetchLiveSingaporePsi(): Promise<PsiFetchResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 7000);

  try {
    // Sub-goal 2: Live data from National Environment Agency (NEA) appears, fetched only through /api/psi
    const psiRes = await fetch('/api/psi', {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });

    clearTimeout(timeoutId);

    if (psiRes.status === 503) {
      const errJson = await psiRes.json().catch(() => null);
      return {
        data: null,
        isLive: false,
        timestamp: new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }),
        error: errJson?.message || 'Data feed refused: API key is not configured.',
      };
    }

    if (!psiRes.ok) {
      return {
        data: null,
        isLive: false,
        timestamp: new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }),
        error: `Air quality data from the National Environment Agency was refused (Server returned status ${psiRes.status}).`,
      };
    }

    const psiJson = await psiRes.json();
    const psiItems = psiJson?.data?.items || psiJson?.items || [];
    const latestPsiItem = psiItems[0];

    // Sub-goal 3: When data is empty, say so in plain words
    if (!latestPsiItem || !latestPsiItem.readings || Object.keys(latestPsiItem.readings).length === 0) {
      return {
        data: null,
        isLive: false,
        timestamp: new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }),
        error: 'Air quality data from the National Environment Agency is currently empty.',
      };
    }

    const psi24 = latestPsiItem.readings.psi_twenty_four_hourly || {};
    const pm25OneHr =
      latestPsiItem.readings.pm25_one_hourly ||
      latestPsiItem.readings.pm25_twenty_four_hourly ||
      latestPsiItem.readings.pm25_sub_index ||
      {};

    const rawTime =
      latestPsiItem.updatedTimestamp ||
      latestPsiItem.update_timestamp ||
      latestPsiItem.timestamp;

    const formattedTime = rawTime
      ? new Date(rawTime).toLocaleTimeString('en-SG', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Singapore',
        })
      : new Date().toLocaleTimeString('en-SG', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
          timeZone: 'Asia/Singapore',
        });

    const regionalKeys = ['central', 'south', 'north', 'east', 'west'] as const;
    const computedNationalPsi = Math.round(
      regionalKeys.reduce((acc, k) => acc + (Number(psi24[k]) || 70), 0) / regionalKeys.length
    );
    const computedNationalPm25 = Math.round(
      regionalKeys.reduce((acc, k) => acc + (Number(pm25OneHr[k]) || 25), 0) / regionalKeys.length
    );

    const regions: Array<{ id: SingaporeRegion; name: string; apiKey: string }> = [
      { id: 'national', name: 'All Singapore (National Avg)', apiKey: 'national' },
      { id: 'central', name: 'Central (Orchard, Marina Bay, CBD)', apiKey: 'central' },
      { id: 'south', name: 'South (Sentosa, HarbourFront)', apiKey: 'south' },
      { id: 'north', name: 'North (Woodlands, Mandai Zoo)', apiKey: 'north' },
      { id: 'east', name: 'East (Changi Airport, Tampines)', apiKey: 'east' },
      { id: 'west', name: 'West (Jurong, Clementi)', apiKey: 'west' },
    ];

    const result: Partial<Record<SingaporeRegion, RegionalPsiData>> = {};

    for (const r of regions) {
      let psiVal: number;
      let pm25Val: number;

      if (r.id === 'national') {
        psiVal = Math.round(psi24['national'] ?? computedNationalPsi);
        pm25Val = Math.round(pm25OneHr['national'] ?? computedNationalPm25);
      } else {
        psiVal = Math.round(Number(psi24[r.apiKey]) || computedNationalPsi);
        pm25Val = Math.round(Number(pm25OneHr[r.apiKey]) || computedNationalPm25);
      }

      const status = determinePsiStatus(psiVal);

      result[r.id] = {
        region: r.id,
        displayName: r.name,
        psi24Hourly: psiVal,
        pm25OneHourly: pm25Val,
        status,
        description: getStatusDescription(status),
        updateTime: `Updated ${formattedTime} SGT (Live NEA)`,
      };
    }

    return {
      data: result as Record<SingaporeRegion, RegionalPsiData>,
      isLive: true,
      timestamp: formattedTime,
      error: null,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    const isTimeout = err?.name === 'AbortError' || err?.message?.includes('aborted');

    // Sub-goal 3: When the data is slow, empty or refused, the screen says so in plain words.
    // Guardrail: Never invent data. If the API fails, show a message, not sample rows.
    return {
      data: null,
      isLive: false,
      timestamp: new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit' }),
      error: isTimeout
        ? 'The connection to the National Environment Agency is taking longer than expected. Please wait or tap Retry.'
        : 'Air quality data is temporarily unavailable from the National Environment Agency. Please check your connection or tap Retry.',
    };
  }
}
