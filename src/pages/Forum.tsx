import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ArrowUp, ArrowDown, MessageSquare, MapPin, CheckCircle2 } from 'lucide-react';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { listPosts, createPost, FORUM_CATEGORIES } from '@/services/forum';
import { useAuth } from '@/context/AuthContext';
import type { ForumCategory, ForumPost } from '@/types';
import { timeAgo, cn } from '@/lib/utils';

type SortMode = 'newest' | 'trending' | 'helpful';

export default function Forum() {
  const { profile, firebaseUser } = useAuth();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [category, setCategory] = useState<ForumCategory | 'All'>('All');
  const [sort, setSort] = useState<SortMode>('newest');
  const [showCompose, setShowCompose] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await listPosts({
        category: category === 'All' ? undefined : category,
        sort,
        take: 30,
      });
      setPosts(data);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, sort]);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-canopy-950 dark:text-cream-50">Farmer Community</h1>
          <p className="mt-1 text-sm text-canopy-700/70 dark:text-cream-200/60">Ask peers, share what worked, help others earn rewards.</p>
        </div>
        <Button icon={<Plus size={16} />} onClick={() => setShowCompose((s) => !s)}>
          New post
        </Button>
      </div>

      {showCompose && (
        <ComposeForm
          onClose={() => setShowCompose(false)}
          onCreated={() => {
            setShowCompose(false);
            load();
          }}
          authorId={firebaseUser?.uid ?? 'guest'}
          authorName={profile?.name ?? 'Farmer'}
          authorVillage={profile?.village}
        />
      )}

      <div className="flex flex-wrap items-center gap-2">
        <FilterChip active={category === 'All'} onClick={() => setCategory('All')}>All</FilterChip>
        {FORUM_CATEGORIES.map((c) => (
          <FilterChip key={c} active={category === c} onClick={() => setCategory(c)}>{c}</FilterChip>
        ))}
      </div>

      <div className="flex gap-2 text-xs">
        {(['newest', 'trending', 'helpful'] as SortMode[]).map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={cn(
              'rounded-full px-3 py-1 font-medium capitalize',
              sort === s ? 'bg-canopy-700 text-cream-50' : 'text-canopy-600 dark:text-canopy-300'
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-canopy-500">Loading discussions…</p>
      ) : posts.length === 0 ? (
        <Card className="text-center">
          <p className="text-sm text-canopy-700 dark:text-cream-200">No posts yet in this category. Start the first conversation.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <Link key={p.id} to={`/app/forum/${p.id}`}>
              <Card className="transition-transform hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <Badge tone="canopy">{p.category}</Badge>
                      {p.hasAcceptedAnswer && (
                        <Badge tone="gold"><CheckCircle2 size={11} className="mr-1 inline" />Resolved</Badge>
                      )}
                      {p.escalated && <Badge tone="soil">Escalated to Officer</Badge>}
                    </div>
                    <h3 className="font-display text-lg font-semibold text-canopy-950 dark:text-cream-50">{p.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-canopy-700/80 dark:text-cream-200/70">{p.description}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-canopy-600 dark:text-canopy-400">
                      <span>{p.authorName}</span>
                      <span>{timeAgo(p.timestamp)}</span>
                      {p.location && <span className="flex items-center gap-0.5"><MapPin size={11} /> {p.location}</span>}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-center gap-1 text-canopy-600 dark:text-canopy-300">
                    <div className="flex items-center gap-1 text-sm font-semibold">
                      <ArrowUp size={14} /> {p.upvotes - p.downvotes}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-canopy-500">
                      <MessageSquare size={12} /> {p.replyCount}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
        active ? 'bg-canopy-700 text-cream-50' : 'glass text-canopy-700 dark:text-cream-200'
      )}
    >
      {children}
    </button>
  );
}

function ComposeForm({
  onClose,
  onCreated,
  authorId,
  authorName,
  authorVillage,
}: {
  onClose: () => void;
  onCreated: () => void;
  authorId: string;
  authorName: string;
  authorVillage?: string;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ForumCategory>('Crops');
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!title.trim() || !description.trim()) return;
    setSaving(true);
    try {
      await createPost({
        authorId,
        authorName,
        authorVillage,
        title: title.trim(),
        description: description.trim(),
        category,
      });
      onCreated();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card strong>
      <div className="space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What's your question?"
          className="w-full rounded-xl border border-canopy-200 dark:border-canopy-700 bg-cream-50/60 dark:bg-canopy-900/40 px-3 py-2.5 text-sm outline-none"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue — crop, symptoms, when it started…"
          rows={3}
          className="w-full rounded-xl border border-canopy-200 dark:border-canopy-700 bg-cream-50/60 dark:bg-canopy-900/40 px-3 py-2.5 text-sm outline-none"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ForumCategory)}
          className="rounded-xl border border-canopy-200 dark:border-canopy-700 bg-cream-50/60 dark:bg-canopy-900/40 px-3 py-2 text-sm outline-none"
        >
          {FORUM_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={saving}>Post</Button>
        </div>
      </div>
    </Card>
  );
}
