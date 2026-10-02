import { useEffect, useState } from 'react';
import {
  Users, MessageSquare, CheckCircle2, Percent, BarChart3, Database, ShieldCheck,
} from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, Badge } from '@/components/ui/Card';
import { getPlatformCounts, listUsers, setUserRole, POPULAR_CROPS, POPULAR_ISSUES, DAU_TREND } from '@/services/admin';
import { KNOWLEDGE_BASE } from '@/services/rag/knowledgeBase';
import type { UserProfile, UserRole } from '@/types';
import { initials } from '@/lib/utils';

const PIE_COLORS = ['#4c7a3d', '#93bc72', '#8b5e34', '#d9a441', '#6b6b3a'];
type Tab = 'overview' | 'users' | 'knowledge';

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('overview');
  const [counts, setCounts] = useState({ users: 0, posts: 0, questions: 0 });
  const [users, setUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    getPlatformCounts().then(setCounts).catch(() => {});
  }, []);

  useEffect(() => {
    if (tab === 'users') listUsers(50).then(setUsers).catch(() => {});
  }, [tab]);

  async function handleRoleChange(uid: string, role: UserRole) {
    await setUserRole(uid, role);
    setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, role } : u)));
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="flex items-center gap-2">
        <ShieldCheck size={22} className="text-soil-600" />
        <h1 className="font-display text-2xl font-semibold text-canopy-950 dark:text-cream-50">Admin Dashboard</h1>
      </div>

      <div className="flex gap-2 text-sm">
        {(['overview', 'users', 'knowledge'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 font-medium capitalize ${tab === t ? 'bg-soil-500 text-cream-50' : 'glass text-canopy-700 dark:text-cream-200'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={<Users size={18} />} label="Farmers" value={counts.users} />
            <StatCard icon={<MessageSquare size={18} />} label="Community Posts" value={counts.posts} />
            <StatCard icon={<CheckCircle2 size={18} />} label="AI Conversations" value={counts.questions} />
            <StatCard icon={<Percent size={18} />} label="AI Accuracy (est.)" value="87%" />
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <Card>
              <h3 className="mb-2 flex items-center gap-2 font-display text-lg font-semibold text-canopy-950 dark:text-cream-50">
                <BarChart3 size={18} /> Daily Active Users
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={DAU_TREND}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="users" stroke="#396a49" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <h3 className="mb-2 font-display text-lg font-semibold text-canopy-950 dark:text-cream-50">Popular Crops</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={POPULAR_CROPS} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {POPULAR_CROPS.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="lg:col-span-2">
              <h3 className="mb-2 font-display text-lg font-semibold text-canopy-950 dark:text-cream-50">Popular Disease/Pest Reports</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={POPULAR_ISSUES} layout="vertical" margin={{ left: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={130} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5e34" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </>
      )}

      {tab === 'users' && (
        <Card className="!p-0 divide-y divide-canopy-200/50 dark:divide-canopy-700/50">
          {users.length ? users.map((u) => (
            <div key={u.uid} className="flex items-center gap-3 px-4 py-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-canopy-100 dark:bg-canopy-800 text-xs font-semibold text-canopy-700 dark:text-canopy-200">
                {initials(u.name)}
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-canopy-900 dark:text-cream-100">{u.name}</p>
                <p className="text-xs text-canopy-600 dark:text-canopy-400">{u.email} · {u.village || '—'}</p>
              </div>
              <Badge tone="gold">{u.rewardPoints} pts</Badge>
              <select
                value={u.role}
                onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                className="rounded-lg border border-canopy-200 dark:border-canopy-700 bg-transparent px-2 py-1 text-xs"
              >
                <option value="farmer">Farmer</option>
                <option value="officer">Officer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )) : (
            <p className="px-4 py-4 text-sm text-canopy-500">No users found (or Firestore rules restrict admin reads until deployed).</p>
          )}
        </Card>
      )}

      {tab === 'knowledge' && (
        <Card className="!p-0 divide-y divide-canopy-200/50 dark:divide-canopy-700/50">
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-canopy-950 dark:text-cream-50">
              <Database size={18} /> Knowledge Base Documents
            </h3>
            <span className="text-xs text-canopy-500">Upload flow connects to RAG_DOCUMENTS pipeline</span>
          </div>
          {KNOWLEDGE_BASE.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-canopy-900 dark:text-cream-100">{doc.title}</p>
                <p className="text-xs text-canopy-600 dark:text-canopy-400">{doc.keywords.slice(0, 4).join(', ')}</p>
              </div>
              <Badge tone="olive">{doc.type}</Badge>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <Card>
      <div className="flex items-center gap-2 text-canopy-600 dark:text-canopy-300">{icon}<span className="text-xs">{label}</span></div>
      <p className="mt-2 text-2xl font-semibold text-canopy-950 dark:text-cream-50">{value}</p>
    </Card>
  );
}
