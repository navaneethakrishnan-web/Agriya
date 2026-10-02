import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Droplets, Wind, Sun, CloudRain, MapPin } from 'lucide-react';
import { Card, Badge } from '@/components/ui/Card';
import { fetchWeather, getBrowserLocation } from '@/services/weather';
import { nearbyFacilities } from '@/data/nearby';
import type { WeatherData, NearbyFacility } from '@/types';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Default Leaflet marker icons don't resolve under Vite bundling; patch via CDN.
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [facilities, setFacilities] = useState<NearbyFacility[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getBrowserLocation()
      .then(async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ lat, lng });
        const w = await fetchWeather(lat, lng);
        setWeather(w);
        setFacilities(nearbyFacilities(lat, lng));
      })
      .catch(() => setError('Enable location access in your browser to see live weather and nearby facilities.'));
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <h1 className="font-display text-2xl font-semibold text-canopy-950 dark:text-cream-50">Weather & Nearby</h1>

      {error && (
        <Card className="text-sm text-soil-700 dark:text-soil-200">{error}</Card>
      )}

      {weather && (
        <>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            <Card className="md:col-span-1">
              <p className="text-xs text-canopy-600 dark:text-canopy-400">{weather.locationName}</p>
              <p className="mt-1 text-5xl font-semibold text-canopy-900 dark:text-cream-50">{weather.temperature}°C</p>
              <p className="text-sm text-canopy-700/70 dark:text-cream-200/60">{weather.condition}</p>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Stat icon={<Droplets size={14} />} label="Humidity" value={`${weather.humidity}%`} />
                <Stat icon={<Wind size={14} />} label="Wind" value={`${weather.windSpeed} km/h`} />
                <Stat icon={<CloudRain size={14} />} label="Rain chance" value={`${weather.rainChance}%`} />
                <Stat icon={<Sun size={14} />} label="UV Index" value={`${weather.uvIndex}`} />
              </div>
            </Card>

            <Card className="md:col-span-2">
              <h3 className="mb-2 font-display text-lg font-semibold text-canopy-950 dark:text-cream-50">7-Day Forecast</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weather.forecast}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="high" fill="#4c7a3d" radius={[6, 6, 0, 0]} name="High °C" />
                  <Bar dataKey="low" fill="#93bc72" radius={[6, 6, 0, 0]} name="Low °C" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card>
            <h3 className="mb-2 font-display text-lg font-semibold text-canopy-950 dark:text-cream-50">Recommended Actions</h3>
            <ul className="space-y-2">
              {weather.advisory.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-canopy-800 dark:text-cream-200">
                  <Badge tone="canopy">Tip</Badge> {a}
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}

      {coords && (
        <Card className="!p-0 overflow-hidden">
          <div className="p-4 pb-0">
            <h3 className="font-display text-lg font-semibold text-canopy-950 dark:text-cream-50 flex items-center gap-2">
              <MapPin size={18} /> Nearby Agricultural Facilities
            </h3>
          </div>
          <div className="h-[360px] w-full">
            <MapContainer center={[coords.lat, coords.lng]} zoom={12} className="h-full w-full">
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[coords.lat, coords.lng]} icon={icon}>
                <Popup>You are here</Popup>
              </Marker>
              {facilities.map((f) => (
                <Marker key={f.id} position={[f.lat, f.lng]} icon={icon}>
                  <Popup>
                    <strong>{f.name}</strong>
                    <br />
                    {f.type} · {f.distanceKm} km away
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {facilities.slice(0, 6).map((f) => (
              <div key={f.id} className="rounded-xl bg-canopy-100/60 dark:bg-canopy-800/50 px-3 py-2 text-xs">
                <p className="font-medium text-canopy-900 dark:text-cream-100">{f.name}</p>
                <p className="text-canopy-600 dark:text-canopy-400">{f.type} · {f.distanceKm} km</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-canopy-100/50 dark:bg-canopy-800/40 px-3 py-2">
      <span className="text-canopy-600 dark:text-canopy-300">{icon}</span>
      <div>
        <p className="text-[11px] text-canopy-600 dark:text-canopy-400">{label}</p>
        <p className="text-sm font-medium text-canopy-900 dark:text-cream-100">{value}</p>
      </div>
    </div>
  );
}
