import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageCircle,
  Users,
  CloudSun,
  Landmark,
  Award,
  UserCircle,
  Moon,
  Sun,
  Sprout,
  ShieldCheck,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { cn, initials } from '@/lib/utils';

const NAV_ITEMS = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/chat', label: 'Ask AI', icon: MessageCircle },
  { to: '/app/forum', label: 'Community', icon: Users },
  { to: '/app/weather', label: 'Weather', icon: CloudSun },
  { to: '/app/schemes', label: 'Schemes', icon: Landmark },
  { to: '/app/rewards', label: 'Rewards', icon: Award },
];

export function AppLayout() {
  const { dark, toggleDark } = useTheme();
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-canopy-950 contour-field">
      <div className="mx-auto flex max-w-[1400px]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-canopy-200/60 dark:border-canopy-800/60 p-5 md:flex">
          <div className="mb-8 flex items-center gap-2 px-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-canopy-700 text-cream-50">
              <Sprout size={18} />
            </div>
            <span className="font-display text-xl font-semibold text-canopy-900 dark:text-cream-100">
              AGRIYA
            </span>
          </div>

          <nav className="flex-1 space-y-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-canopy-700 text-cream-50 shadow-sm'
                      : 'text-canopy-800 dark:text-canopy-200 hover:bg-canopy-100 dark:hover:bg-canopy-800/60'
                  )
                }
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
            {profile?.role === 'admin' && (
              <NavLink
                to="/app/admin"
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-soil-500 text-cream-50'
                      : 'text-soil-700 dark:text-soil-300 hover:bg-soil-100 dark:hover:bg-soil-700/20'
                  )
                }
              >
                <ShieldCheck size={18} />
                Admin
              </NavLink>
            )}
          </nav>

          <NavLink
            to="/app/profile"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-canopy-800 dark:text-canopy-200 hover:bg-canopy-100 dark:hover:bg-canopy-800/60"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-300 text-xs font-semibold text-canopy-900">
              {profile ? initials(profile.name) : <UserCircle size={18} />}
            </span>
            {profile?.name ?? 'Profile'}
          </NavLink>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-canopy-200/60 dark:border-canopy-800/60 bg-cream-100/80 dark:bg-canopy-950/80 px-4 py-3 backdrop-blur-md md:px-8">
            <div className="flex items-center gap-2 md:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-canopy-700 text-cream-50">
                <Sprout size={16} />
              </div>
              <span className="font-display text-lg font-semibold text-canopy-900 dark:text-cream-100">
                AGRIYA
              </span>
            </div>
            <div className="hidden md:block" />
            <button
              onClick={toggleDark}
              aria-label="Toggle dark mode"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-canopy-300/60 dark:border-canopy-700 text-canopy-700 dark:text-cream-100 hover:bg-canopy-100 dark:hover:bg-canopy-800"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </header>

          <main className="flex-1 px-4 pb-24 pt-4 md:px-8 md:pb-8 md:pt-6">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-canopy-200/60 dark:border-canopy-800/60 bg-cream-50/95 dark:bg-canopy-900/95 px-1 py-2 backdrop-blur-md md:hidden">
        {NAV_ITEMS.slice(0, 5).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[10px] font-medium',
                isActive ? 'text-canopy-700 dark:text-canopy-200' : 'text-canopy-400 dark:text-canopy-500'
              )
            }
          >
            <item.icon size={19} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
