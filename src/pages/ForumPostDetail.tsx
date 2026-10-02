import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowUp, ArrowDown, CheckCircle2, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Card, Badge } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getPost, listReplies, addReply, vote, acceptAnswer } from '@/services/forum';
import { useAuth } from '@/context/AuthContext';
import type { ForumPost, ForumReply } from '@/types';
import { timeAgo, cn, initials } from '@/lib/utils';

const ESCALATION_WINDOW_MS = 48 * 60 * 60 * 1000;

export default function ForumPostDetail() {
  const { id } = useParams();
  const { profile, firebaseUser } = useAuth();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [reply, setReply] = useState('');
  const [posting, setPosting] = useState(false);

  async function load() {
    if (!id) return;
    const [p, r] = await Promise.all([getPost(id), listReplies(id)]);
    setPost(p);
    setReplies(r);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!post) {
    return <p className="mx-auto max-w-3xl text-sm text-canopy-500">Loading discussion…</p>;
  }

  const unresolvedPastWindow =
    !post.hasAcceptedAnswer && replies.length === 0 && Date.now() - post.timestamp > ESCALATION_WINDOW_MS;

  async function submitReply() {
    if (!reply.trim() || !id) return;
    setPosting(true);
    try {
      await addReply({
        postId: id,
        authorId: firebaseUser?.uid ?? 'guest',
        authorName: profile?.name ?? 'Farmer',
        content: reply.trim(),
      });
      setReply('');
      load();
    } finally {
      setPosting(false);
    }
  }

  async function handleVote(target: 'post' | string, dir: 'up' | 'down') {
    if (!id) return;
    if (target === 'post') {
      await vote('community_posts', id, dir);
    } else {
      await vote('comments', target, dir);
    }
    load();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Link to="/app/forum" className="flex items-center gap-1 text-sm text-canopy-700 dark:text-canopy-300">
        <ArrowLeft size={15} /> Back to community
      </Link>

      {unresolvedPastWindow && (
        <div className="flex items-center gap-2 rounded-xl bg-soil-100 dark:bg-soil-700/20 px-4 py-3 text-sm text-soil-700 dark:text-soil-200">
          <ShieldAlert size={16} />
          No answer within 48 hours — this question has been escalated to an Agriculture Officer.
        </div>
      )}

      <Card strong>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge tone="canopy">{post.category}</Badge>
          {post.hasAcceptedAnswer && <Badge tone="gold"><CheckCircle2 size={11} className="mr-1 inline" />Resolved</Badge>}
        </div>
        <h1 className="font-display text-2xl font-semibold text-canopy-950 dark:text-cream-50">{post.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-canopy-800/85 dark:text-cream-200/80">{post.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-canopy-600 dark:text-canopy-400">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-canopy-100 dark:bg-canopy-800 text-[10px] font-semibold text-canopy-700 dark:text-canopy-200">
              {initials(post.authorName)}
            </span>
            {post.authorName} · {timeAgo(post.timestamp)}
          </div>
          <VoteButtons up={post.upvotes} down={post.downvotes} onVote={(dir) => handleVote('post', dir)} />
        </div>
      </Card>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-canopy-950 dark:text-cream-50">
          {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </h2>
        <div className="space-y-3">
          {replies.map((r) => (
            <Card key={r.id} className={cn(r.accepted && 'ring-2 ring-gold-500')}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  {r.accepted && <Badge tone="gold" className="mb-1.5"><CheckCircle2 size={11} className="mr-1 inline" />Accepted answer</Badge>}
                  <p className="text-sm text-canopy-900 dark:text-cream-100">{r.content}</p>
                  <p className="mt-2 text-xs text-canopy-600 dark:text-canopy-400">{r.authorName} · {timeAgo(r.timestamp)}</p>
                </div>
                <VoteButtons up={r.upvotes} down={r.downvotes} onVote={(dir) => handleVote(r.id, dir)} />
              </div>
              {!r.accepted && post.authorId === (firebaseUser?.uid ?? '') && (
                <button
                  onClick={async () => {
                    await acceptAnswer(post.id, r.id);
                    load();
                  }}
                  className="mt-2 text-xs font-medium text-canopy-700 dark:text-canopy-300 underline"
                >
                  Mark as accepted answer
                </button>
              )}
            </Card>
          ))}
        </div>
      </div>

      <Card>
        <textarea
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Share what worked for you…"
          rows={3}
          className="w-full rounded-xl border border-canopy-200 dark:border-canopy-700 bg-cream-50/60 dark:bg-canopy-900/40 px-3 py-2.5 text-sm outline-none"
        />
        <div className="mt-2 flex justify-end">
          <Button onClick={submitReply} loading={posting}>Reply</Button>
        </div>
      </Card>
    </div>
  );
}

function VoteButtons({ up, down, onVote }: { up: number; down: number; onVote: (dir: 'up' | 'down') => void }) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button onClick={() => onVote('up')} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-canopy-100 dark:hover:bg-canopy-800 text-canopy-600 dark:text-canopy-300">
        <ArrowUp size={14} />
      </button>
      <span className="text-sm font-medium text-canopy-800 dark:text-cream-100">{up - down}</span>
      <button onClick={() => onVote('down')} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-canopy-100 dark:hover:bg-canopy-800 text-canopy-600 dark:text-canopy-300">
        <ArrowDown size={14} />
      </button>
    </div>
  );
}
