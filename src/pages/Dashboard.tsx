import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  MessageCircle,
  Users,
  ScanLine,
  CloudSun,
  Landmark,
  Award,
  MapPin,
  TrendingUp,
  ArrowUpRight,
  Droplets,
  Wind,
} from 'lucide-react';
import { Card, Badge } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { fetchWeather, getBrowserLocation } from '@/services/weather';
import { listPosts } from '@/services/forum';
import type { WeatherData, ForumPost } from '@/types';
import { GOV_SCHEMES } from '@/data/schemes';
import { timeAgo } from '@/lib/utils';

const QUICK_ACTIONS = [
  { to: '/app/chat', label: 'Ask AI', icon: MessageCircle },
  { to: '/app/forum', label: 'Forum', icon: Users },
  { to: '/app/chat?mode=scan', label: 'Scan Crop', icon: ScanLine },
  { to: '/app/weather', label: 'Weather', icon: CloudSun },
  { to: '/app/schemes', label: 'Schemes', icon: Landmark },
  { to: '/app/rewards', label: 'My Rewards', icon: Award },
];

export default function Dashboard() {
  const { profile } = useAuth();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [trending, setTrending] = useState<ForumPost[]>([]);
  const firstName = profile?.name?.split(' ')[0] ?? 'Farmer';

  useEffect(() => {
    getBrowserLocation()
      .then((pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude))
      .then(setWeather)
      .catch(() => setWeather(null));

    listPosts({ sort: 'trending', take: 4 })
      .then(setTrending)
      .catch(() => setTrending([]));
  }, []);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-canopy-950 dark:text-cream-50 md:text-3xl">
          Good morning, {firstName}.
        </h1>
        <p className="mt-1 text-sm text-canopy-700/70 dark:text-cream-200/60">
          Here's what needs your attention today.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {QUICK_ACTIONS.map((a) => (
          <Link
            key={a.label}
            to={a.to}
            className="glass flex flex-col items-center gap-2 rounded-2xl px-2 py-4 text-center transition-transform hover:-translate-y-0.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-canopy-700/10 text-canopy-700 dark:bg-canopy-400/10 dark:text-canopy-300">
              <a.icon size={18} />
            </div>
            <span className="text-xs font-medium text-canopy-800 dark:text-cream-100">{a.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Weather */}
        <Card className="lg:col-span-1">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-canopy-950 dark:text-cream-50">Today's Weather</h3>
            <CloudSun size={18} className="text-canopy-600" />
          </div>
          {weather ? (
            <>
              <p className="mt-3 text-4xl font-semibold text-canopy-900 dark:text-cream-50">{weather.temperature}°C</p>
              <p className="text-sm text-canopy-700/70 dark:text-cream-200/60">{weather.condition} · {weather.locationName}</p>
              <div className="mt-4 flex gap-4 text-xs text-canopy-700 dark:text-cream-200">
                <span className="flex items-center gap-1"><Droplets size={13} /> {weather.humidity}%</span>
                <span className="flex items-center gap-1"><Wind size={13} /> {weather.windSpeed} km/h</span>
                <span className="flex items-center gap-1">☔ {weather.rainChance}%</span>
              </div>
              <p className="mt-3 rounded-xl bg-canopy-100/70 dark:bg-canopy-800/50 px-3 py-2 text-xs text-canopy-800 dark:text-cream-200">
                {weather.advisory[0]}
              </p>
            </>
          ) : (
            <p className="mt-4 text-sm text-canopy-500">Enable location access to see live weather.</p>
          )}
          <Link to="/app/weather" className="mt-4 flex items-center gap-1 text-xs font-medium text-canopy-700 dark:text-canopy-300">
            Full forecast <ArrowUpRight size={13} />
          </Link>
        </Card>

        {/* Reward points */}
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-canopy-950 dark:text-cream-50">Reward Points</h3>
            <Award size={18} className="text-gold-500" />
          </div>
          <p className="mt-3 text-4xl font-semibold text-gold-600 dark:text-gold-300">{profile?.rewardPoints ?? 10}</p>
          <p className="text-sm text-canopy-700/70 dark:text-cream-200/60">Redeemable on seeds, fertilizer & equipment</p>
          <Link to="/app/rewards" className="mt-4 flex items-center gap-1 text-xs font-medium text-canopy-700 dark:text-canopy-300">
            Redeem now <ArrowUpRight size={13} />
          </Link>
        </Card>

        {/* Latest subsidies */}
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-canopy-950 dark:text-cream-50">Latest Subsidies</h3>
            <Landmark size={18} className="text-soil-500" />
          </div>
          <ul className="mt-3 space-y-2">
            {GOV_SCHEMES.slice(0, 3).map((s) => (
              <li key={s.id} className="text-sm">
                <p className="font-medium text-canopy-900 dark:text-cream-100">{s.name}</p>
                <p className="text-xs text-canopy-700/70 dark:text-cream-200/60">{s.benefit}</p>
              </li>
            ))}
          </ul>
          <Link to="/app/schemes" className="mt-4 flex items-center gap-1 text-xs font-medium text-canopy-700 dark:text-canopy-300">
            View all schemes <ArrowUpRight size={13} />
          </Link>
        </Card>

        {/* Crop health */}
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-canopy-950 dark:text-cream-50">Crop Health</h3>
            <ScanLine size={18} className="text-canopy-600" />
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-canopy-100 dark:bg-canopy-800">
              <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
                <path d="M18 2 a 16 16 0 1 1 0 32 a 16 16 0 1 1 0 -32" fill="none" stroke="currentColor" strokeWidth="3" className="text-canopy-200 dark:text-canopy-700" />
                <path d="M18 2 a 16 16 0 1 1 0 32 a 16 16 0 1 1 0 -32" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="78 100" className="text-canopy-500" />
              </svg>
              <span className="absolute text-sm font-semibold text-canopy-900 dark:text-cream-50">78%</span>
            </div>
            <div className="text-sm text-canopy-700/80 dark:text-cream-200/70">
              No major pest or disease risk detected this week. Scan a leaf photo for an instant check.
            </div>
          </div>
          <Link to="/app/chat?mode=scan" className="mt-4 flex items-center gap-1 text-xs font-medium text-canopy-700 dark:text-canopy-300">
            Scan a crop photo <ArrowUpRight size={13} />
          </Link>
        </Card>

        {/* Nearby office */}
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-canopy-950 dark:text-cream-50">Nearby Agriculture Office</h3>
            <MapPin size={18} className="text-soil-500" />
          </div>
          <p className="mt-3 text-sm text-canopy-800 dark:text-cream-100 font-medium">Block Agriculture Office</p>
          <p className="text-xs text-canopy-700/70 dark:text-cream-200/60">~2.4 km away · Open until 5:30 PM</p>
          <Link to="/app/weather" className="mt-4 flex items-center gap-1 text-xs font-medium text-canopy-700 dark:text-canopy-300">
            View on map <ArrowUpRight size={13} />
          </Link>
        </Card>

        {/* Trending discussions */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-canopy-950 dark:text-cream-50">Trending Community Discussions</h3>
            <TrendingUp size={18} className="text-canopy-600" />
          </div>
          <ul className="mt-3 divide-y divide-canopy-200/50 dark:divide-canopy-700/50">
            {trending.length ? (
              trending.map((p) => (
                <li key={p.id} className="py-2.5">
                  <Link to={`/app/forum/${p.id}`} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-canopy-900 dark:text-cream-100">{p.title}</p>
                      <p className="text-xs text-canopy-700/60 dark:text-cream-200/50">{timeAgo(p.timestamp)} · {p.replyCount} replies</p>
                    </div>
                    <Badge tone="canopy">{p.category}</Badge>
                  </Link>
                </li>
              ))
            ) : (
              <p className="py-3 text-sm text-canopy-500">No discussions yet — be the first to post!</p>
            )}
          </ul>
        </Card>

        {/* My questions */}
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-canopy-950 dark:text-cream-50">My Questions</h3>
            <MessageCircle size={18} className="text-canopy-600" />
          </div>
          <p className="mt-4 text-sm text-canopy-700/70 dark:text-cream-200/60">
            Start a conversation with AGRIYA AI to see your question history here.
          </p>
          <Link to="/app/chat" className="mt-4 flex items-center gap-1 text-xs font-medium text-canopy-700 dark:text-canopy-300">
            Ask a question <ArrowUpRight size={13} />
          </Link>
        </Card>
      </div>
    </div>
  );
}
