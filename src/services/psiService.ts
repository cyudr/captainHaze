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

export async function fetchLiveSingaporePsi(): Promise<{
  data: Record<SingaporeRegion, RegionalPsiData>;
  isLive: boolean;
  timestamp: string;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    // Fetch live PSI and PM2.5 concurrently from server proxy endpoints
    const [psiRes, pm25Res] = await Promise.all([
      fetch('/api/psi', {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      }),
      fetch('/api/pm25', {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      }).catch(() => null),
    ]);

    clearTimeout(timeoutId);

    if (!psiRes.ok) {
      throw new Error(`PSI API returned status ${psiRes.status}`);
    }

    const psiJson = await psiRes.json();
    const pm25Json = pm25Res && pm25Res.ok ? await pm25Res.json().catch(() => null) : null;

    // Support both v2 wrapper { code: 0, data: { items: [...] } } and v1 { items: [...] }
    const psiItems = psiJson?.data?.items || psiJson?.items || [];
    const latestPsiItem = psiItems[0];

    if (!latestPsiItem || !latestPsiItem.readings) {
      throw new Error('Invalid format from PSI feed');
    }

    const pm25Items = pm25Json?.data?.items || pm25Json?.items || [];
    const latestPm25Item = pm25Items[0];

    const psi24 = latestPsiItem.readings.psi_twenty_four_hourly || {};
    const pm25OneHr =
      latestPm25Item?.readings?.pm25_one_hourly ||
      latestPsiItem.readings.pm25_one_hourly ||
      latestPsiItem.readings.pm25_twenty_four_hourly ||
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
        psiVal = Math.round(psi24[r.apiKey] ?? 70);
        pm25Val = Math.round(pm25OneHr[r.apiKey] ?? 25);
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
    };
  } catch (err) {
    console.warn('Using NEA cached baseline data due to network:', err);
    return {
      data: FALLBACK_PSI_DATA as Record<SingaporeRegion, RegionalPsiData>,
      isLive: false,
      timestamp: 'Simulated Baseline (Live fallback)',
    };
  }
}
