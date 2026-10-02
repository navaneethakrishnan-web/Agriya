import { Link } from 'react-router-dom';
import { Sprout } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream-100 dark:bg-canopy-950 text-center px-4">
      <Sprout size={40} className="text-canopy-500" />
      <h1 className="font-display text-3xl font-semibold text-canopy-950 dark:text-cream-50">Field not found</h1>
      <p className="text-sm text-canopy-700/70 dark:text-cream-200/60">This page doesn't exist. Let's get you back to familiar ground.</p>
      <Link to="/" className="rounded-full bg-canopy-700 px-6 py-2.5 text-sm font-medium text-cream-50">
        Back to home
      </Link>
    </div>
  );
}
