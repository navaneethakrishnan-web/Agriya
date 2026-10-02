import { useMemo, useState } from 'react';
import { Search, Bookmark, ExternalLink } from 'lucide-react';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { GOV_SCHEMES, filterSchemes } from '@/data/schemes';
import { cn } from '@/lib/utils';

const STATES = ['All', 'All India', 'Tamil Nadu', 'Kerala', 'Karnataka', 'Maharashtra'];
const CATEGORIES = ['All', 'Income Support', 'Insurance', 'Credit', 'Advisory', 'Irrigation', 'Equipment', 'Infrastructure', 'Organic Farming'];

export default function Schemes() {
  const [search, setSearch] = useState('');
  const [state, setState] = useState('All');
  const [category, setCategory] = useState('All');
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());

  const results = useMemo(
    () => filterSchemes(GOV_SCHEMES, { search, state, category }),
    [search, state, category]
  );

  function toggleBookmark(id: string) {
    setBookmarked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <h1 className="font-display text-2xl font-semibold text-canopy-950 dark:text-cream-50">Government Schemes</h1>

      <Card className="space-y-3">
        <label className="flex items-center gap-2 rounded-xl border border-canopy-200 dark:border-canopy-700 bg-cream-50/60 dark:bg-canopy-900/40 px-3 py-2.5">
          <Search size={16} className="text-canopy-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search schemes by name or benefit…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-canopy-400"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <select value={state} onChange={(e) => setState(e.target.value)} className="rounded-xl border border-canopy-200 dark:border-canopy-700 bg-cream-50/60 dark:bg-canopy-900/40 px-3 py-2 text-sm">
            {STATES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-canopy-200 dark:border-canopy-700 bg-cream-50/60 dark:bg-canopy-900/40 px-3 py-2 text-sm">
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {results.map((s) => (
          <Card key={s.id} className="flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Badge tone="canopy">{s.category}</Badge>
                <h3 className="mt-2 font-display text-lg font-semibold text-canopy-950 dark:text-cream-50">{s.name}</h3>
              </div>
              <button
                onClick={() => toggleBookmark(s.id)}
                className={cn('shrink-0 rounded-full p-2', bookmarked.has(s.id) ? 'text-gold-600' : 'text-canopy-400')}
              >
                <Bookmark size={18} fill={bookmarked.has(s.id) ? 'currentColor' : 'none'} />
              </button>
            </div>
            <p className="mt-2 text-sm text-canopy-800/80 dark:text-cream-200/70">{s.description}</p>
            <div className="mt-3 space-y-1 text-xs text-canopy-700 dark:text-cream-200">
              <p><strong>Eligibility:</strong> {s.eligibility}</p>
              <p><strong>Benefit:</strong> {s.benefit}</p>
              {s.deadline && <p><strong>Window:</strong> {s.deadline}</p>}
            </div>
            <Button variant="outline" size="sm" className="mt-4 self-start" icon={<ExternalLink size={14} />}>
              Apply
            </Button>
          </Card>
        ))}
        {results.length === 0 && (
          <p className="text-sm text-canopy-500 md:col-span-2">No schemes match your filters.</p>
        )}
      </div>
    </div>
  );
}
