/**
 * Real-Time Agro-Climatic Weather Service
 * Integrates with Open-Meteo APIs (https://open-meteo.com/en/docs)
 * Provides real-time environmental data: Temperature, Relative Humidity,
 * Precipitation Accumulation, Modelled Topsoil Moisture (0-1cm depth), and Wind Speed.
 */

const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const OPEN_METEO_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const BACKEND_FALLBACK_URL = '/api/weather/agro-climate';

// Preset agricultural corn-growing zones with representative coordinates
export const AGRICULTURAL_PRESETS = [
  {
    id: 'central-zone',
    name: 'Central Zone (Nagpur / Vidarbha Belt)',
    zone: 'Central Zone',
    latitude: 21.1458,
    longitude: 79.0882,
    country: 'India',
    elevation: '312 m'
  },
  {
    id: 'north-zone',
    name: 'North Zone (Karnal / Indo-Gangetic Plain)',
    zone: 'North Zone',
    latitude: 29.6857,
    longitude: 76.9905,
    country: 'India',
    elevation: '253 m'
  },
  {
    id: 'south-zone',
    name: 'South Zone (Davanagere / Deccan Plateau)',
    zone: 'South Zone',
    latitude: 14.4644,
    longitude: 75.9218,
    country: 'India',
    elevation: '602 m'
  },
  {
    id: 'east-zone',
    name: 'East Zone (Purnia / Kosi Corn Belt)',
    zone: 'East Zone',
    latitude: 25.7771,
    longitude: 87.4753,
    country: 'India',
    elevation: '36 m'
  },
  {
    id: 'west-zone',
    name: 'West Zone (Chhatrapati Sambhajinagar)',
    zone: 'West Zone',
    latitude: 19.8762,
    longitude: 75.3433,
    country: 'India',
    elevation: '569 m'
  },
  {
    id: 'us-corn-belt',
    name: 'US Corn Belt (Des Moines, Iowa)',
    zone: 'North Zone',
    latitude: 41.5868,
    longitude: -93.6250,
    country: 'United States',
    elevation: '293 m'
  }
];

export const DEFAULT_FARM_LOCATION = AGRICULTURAL_PRESETS[0];

const STORAGE_KEY = 'corn_pest_agro_location';

export function getSavedLocation() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
        return parsed;
      }
    }
  } catch {
    // Ignore localStorage parse errors
  }
  return DEFAULT_FARM_LOCATION;
}

export function saveLocation(loc) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Fetches real weather and soil moisture from Open-Meteo.
 * Falls back to local Flask backend proxy if network or CORS requires.
 */
export async function fetchAgroClimateData(latitude, longitude, signal = null) {
  const lat = Number(latitude);
  const lon = Number(longitude);

  const queryParams = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    current: 'temperature_2m,relative_humidity_2m,rain,wind_speed_10m',
    hourly: 'soil_moisture_0_to_1cm',
    timezone: 'auto'
  });

  const url = `${OPEN_METEO_FORECAST_URL}?${queryParams.toString()}`;

  let rawData = null;
  let sourceOrigin = 'Open-Meteo Direct API';

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: signal,
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Open-Meteo HTTP ${response.status}`);
    }
    rawData = await response.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      throw err; // Forward abort
    }

    // Attempt fallback via local Flask proxy
    try {
      const fallbackUrl = `${BACKEND_FALLBACK_URL}?latitude=${lat}&longitude=${lon}`;
      const fallbackRes = await fetch(fallbackUrl, { signal });
      if (fallbackRes.ok) {
        const json = await fallbackRes.json();
        if (json.status === 'success') {
          return {
            temperature: json.readings.temperature.value,
            humidity: json.readings.humidity.value,
            rainfall: json.readings.rainfall.value,
            soilMoisture: json.readings.soil_moisture.value,
            windSpeed: json.readings.wind_speed.value,
            sourceModelTime: json.timestamps.source_model_time,
            fetchTime: new Date().toLocaleTimeString(),
            elevation: json.elevation,
            timezone: json.timezone,
            soilMoistureMeta: {
              depth: json.readings.soil_moisture.measurement_depth,
              modelType: json.readings.soil_moisture.model_type,
              nature: json.readings.soil_moisture.data_nature,
              timestamp: json.readings.soil_moisture.data_timestamp,
              isPhysicalSensor: false
            },
            rainfallTimeBasis: json.readings.rainfall.time_basis,
            dataSource: 'Open-Meteo via Backend Proxy',
            isLive: true
          };
        }
      }
    } catch {
      // Both attempts failed, throw original error
    }
    throw err;
  }

  // Parse Open-Meteo direct response
  const current = rawData.current || {};
  const hourly = rawData.hourly || {};

  // Extract soil moisture matching current hour
  let soilMoistureVal = 0.0;
  let hourlyTimestamp = null;
  const currTimeStr = current.time || '';

  if (currTimeStr && hourly.time && hourly.soil_moisture_0_to_1cm) {
    const times = hourly.time;
    const values = hourly.soil_moisture_0_to_1cm;
    const currHour = currTimeStr.length >= 13 ? `${currTimeStr.substring(0, 13)}:00` : currTimeStr;
    const idx = times.indexOf(currHour);
    const targetIdx = idx !== -1 ? idx : 0;

    if (values[targetIdx] !== undefined && values[targetIdx] !== null) {
      // Unit is m³/m³. Multiply by 100 for volumetric moisture percentage
      soilMoistureVal = Math.round(Number(values[targetIdx]) * 100);
      hourlyTimestamp = times[targetIdx];
    }
  }

  const rainValMm = current.rain !== undefined ? Math.round(Number(current.rain)) : 0;
  const humidityValPct = current.relative_humidity_2m !== undefined ? Math.round(Number(current.relative_humidity_2m)) : null;

  return {
    // Full whole number without decimal point
    temperature: current.temperature_2m !== undefined ? Math.round(Number(current.temperature_2m)) : null,
    humidity: humidityValPct,
    // Humidity in cm (full integer)
    humidityCm: humidityValPct !== null ? Math.round(humidityValPct * 0.05) : null,
    // Rainfall in mm (full integer)
    rainfall: rainValMm,
    // Rainfall in cm (full integer, e.g. 0, 1, 2)
    rainfallCm: Math.round(rainValMm / 10),
    // Soil moisture % (full integer)
    soilMoisture: Math.round(soilMoistureVal),
    // Wind speed km/h (full integer)
    windSpeed: current.wind_speed_10m !== undefined ? Math.round(Number(current.wind_speed_10m)) : null,
    sourceModelTime: current.time,
    fetchTime: new Date().toLocaleTimeString(),
    elevation: rawData.elevation ? Math.round(rawData.elevation) : null,
    timezone: rawData.timezone,
    timezoneAbbreviation: rawData.timezone_abbreviation,
    soilMoistureMeta: {
      depth: '0–1 cm topsoil',
      modelType: 'ECMWF IFS / Land Surface Numerical Model',
      nature: 'Hourly numerical model reanalysis (Not a physical sensor)',
      timestamp: hourlyTimestamp || current.time,
      isPhysicalSensor: false
    },
    rainfallTimeBasis: 'Precipitation during current 1h / 15-min interval',
    dataSource: sourceOrigin,
    isLive: true
  };
}

/**
 * Searches location by name using Open-Meteo Geocoding API.
 */
export async function searchGeocodingLocations(query, signal = null) {
  if (!query || query.trim().length < 2) return [];

  const url = `${OPEN_METEO_GEOCODING_URL}?name=${encodeURIComponent(query.trim())}&count=6&language=en&format=json`;
  try {
    const res = await fetch(url, { signal });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map((item) => ({
      id: `geo-${item.id}`,
      name: `${item.name}${item.admin1 ? `, ${item.admin1}` : ''}`,
      zone: determineZone(item.latitude, item.longitude, item.country_code),
      latitude: item.latitude,
      longitude: item.longitude,
      country: item.country || item.country_code || '',
      elevation: item.elevation ? `${Math.round(item.elevation)} m` : ''
    }));
  } catch {
    return [];
  }
}

/**
 * Reverse geocodes coordinates to a human-readable farm/district name.
 */
export async function reverseGeocodeLocation(lat, lon, signal = null) {
  try {
    const res = await fetch(`/api/weather/reverse-geocode?lat=${lat}&lon=${lon}`, { signal });
    if (res.ok) {
      const data = await res.json();
      if (data.display_name) return data.display_name;
    }
  } catch {
    // fallback
  }
  return `Pinned Farm (${Number(lat).toFixed(3)}°, ${Number(lon).toFixed(3)}°)`;
}

/**
 * Helper to match coordinates to closest agricultural model zone for seamless form autofill.
 */
export function determineZone(lat, lon, countryCode = 'IN') {
  if (countryCode && countryCode.toUpperCase() !== 'IN') {
    return 'North Zone';
  }
  if (lat >= 27.0) return 'North Zone';
  if (lat <= 16.0) return 'South Zone';
  if (lon >= 83.0) return 'East Zone';
  if (lon <= 74.5) return 'West Zone';
  return 'Central Zone';
}
