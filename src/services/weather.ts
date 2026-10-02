import type { WeatherData, DayForecast } from '@/types';

const WEATHER_CODE_MAP: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mostly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Dense drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  71: 'Light snow',
  80: 'Rain showers',
  81: 'Rain showers',
  82: 'Violent showers',
  95: 'Thunderstorm',
};

function conditionFor(code: number) {
  return WEATHER_CODE_MAP[code] ?? 'Variable conditions';
}

export function getBrowserLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported by this browser'));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
    });
  });
}

export async function fetchWeather(lat: number, lng: number): Promise<WeatherData> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', lat.toString());
  url.searchParams.set('longitude', lng.toString());
  url.searchParams.set(
    'current',
    'temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,uv_index'
  );
  url.searchParams.set(
    'daily',
    'temperature_2m_max,temperature_2m_min,precipitation_probability_max,weather_code'
  );
  url.searchParams.set('timezone', 'auto');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error('Weather service unavailable');
  const data = await res.json();

  const forecast: DayForecast[] = data.daily.time
    .slice(0, 7)
    .map((date: string, i: number) => ({
      day: new Date(date).toLocaleDateString('en-IN', { weekday: 'short' }),
      high: Math.round(data.daily.temperature_2m_max[i]),
      low: Math.round(data.daily.temperature_2m_min[i]),
      rainChance: data.daily.precipitation_probability_max[i] ?? 0,
      condition: conditionFor(data.daily.weather_code[i]),
    }));

  const locationName = await reverseGeocode(lat, lng);

  const weather: WeatherData = {
    temperature: Math.round(data.current.temperature_2m),
    humidity: Math.round(data.current.relative_humidity_2m),
    windSpeed: Math.round(data.current.wind_speed_10m),
    rainChance: forecast[0]?.rainChance ?? 0,
    uvIndex: Math.round(data.current.uv_index ?? 0),
    condition: conditionFor(data.current.weather_code),
    locationName,
    forecast,
    advisory: buildAdvisory(forecast, data.current),
  };

  return weather;
}

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lng}&language=en`;
    const res = await fetch(url);
    const data = await res.json();
    const place = data?.results?.[0];
    if (!place) return 'Your location';
    return [place.name, place.admin1].filter(Boolean).join(', ');
  } catch {
    return 'Your location';
  }
}

function buildAdvisory(forecast: DayForecast[], current: { relative_humidity_2m: number }): string[] {
  const advisory: string[] = [];
  const rainSoon = forecast.slice(0, 2).some((d) => d.rainChance >= 60);
  const dry = forecast.slice(0, 3).every((d) => d.rainChance < 30);

  if (rainSoon) {
    advisory.push('High rain chance in the next 2 days — delay pesticide/fertilizer spraying.');
  }
  if (dry) {
    advisory.push('Dry spell expected — plan irrigation for the next 3 days.');
  }
  if (current.relative_humidity_2m > 80) {
    advisory.push('High humidity favours fungal disease — inspect crops for early symptoms.');
  }
  if (advisory.length === 0) {
    advisory.push('Conditions look stable — good window for routine field operations.');
  }
  return advisory;
}
